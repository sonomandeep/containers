package agent

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/events"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/go-connections/nat"
)

const (
	dockerContainerType = "container"
	dockerImageType     = "image"
)

type ContainerPort struct {
	IPVersion string `json:"ipVersion"`
	Private   int    `json:"private"`
	Public    *int   `json:"public,omitempty"`
	Type      string `json:"type"`
}

type ContainerMemory struct {
	Used  uint64 `json:"used"`
	Total uint64 `json:"total"`
}

type ContainerMetrics struct {
	CPU    float64         `json:"cpu"`
	Memory ContainerMemory `json:"memory"`
}

type EnvironmentVariable struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type Container struct {
	ID      string                `json:"id"`
	Name    string                `json:"name"`
	Image   string                `json:"image"`
	State   string                `json:"state"`
	Status  string                `json:"status"`
	Ports   []ContainerPort       `json:"ports"`
	Metrics *ContainerMetrics     `json:"metrics,omitempty"`
	Envs    []EnvironmentVariable `json:"envs"`
	Host    *string               `json:"host,omitempty"`
	Created int64                 `json:"created"`
}

type ImageContainer struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	State string `json:"state"`
}

type Image struct {
	ID           string           `json:"id"`
	Name         string           `json:"name"`
	Tags         []string         `json:"tags"`
	Size         int64            `json:"size"`
	Layers       *int             `json:"layers,omitempty"`
	OS           string           `json:"os"`
	Architecture string           `json:"architecture"`
	Registry     string           `json:"registry"`
	Containers   []ImageContainer `json:"containers"`
}

func (a *Agent) parseDockerEvent(ctx context.Context, msg events.Message) (*Event, error) {
	if msg.Type == "" {
		return nil, fmt.Errorf("docker event missing type")
	}

	eventType := fmt.Sprintf("%s.%s", msg.Type, msg.Action)

	switch msg.Type {
	case dockerContainerType:
		container, err := a.containerPayload(ctx, msg)
		if err != nil {
			return nil, err
		}
		return &Event{Type: eventType, TS: time.Unix(0, msg.TimeNano), Data: container}, nil
	case dockerImageType:
		image, err := a.imagePayload(ctx, msg)
		if err != nil {
			return nil, err
		}
		return &Event{Type: eventType, TS: time.Unix(0, msg.TimeNano), Data: image}, nil
	default:
		return nil, nil
	}
}

func (a *Agent) containerPayload(ctx context.Context, msg events.Message) (*Container, error) {
	if msg.Actor.ID == "" {
		return nil, fmt.Errorf("container event missing id")
	}

	info, err := a.cli.ContainerInspect(ctx, msg.Actor.ID)
	if err != nil {
		fallback := buildContainerFallback(msg)
		return &fallback, nil
	}

	var metrics *ContainerMetrics
	if info.State != nil && info.State.Running {
		data, err := a.getContainerMetrics(ctx, info)
		if err == nil {
			metrics = data
		}
	}

	container := containerFromInspect(info, metrics, msg.Time)
	return &container, nil
}

func containerFromInspect(
	info container.InspectResponse,
	metrics *ContainerMetrics,
	fallbackCreated int64,
) Container {
	name := strings.TrimPrefix(info.Name, "/")
	if name == "" {
		name = "-"
	}

	image := ""
	if info.Config != nil {
		image = info.Config.Image
	}

	state := ""
	status := ""
	if info.State != nil {
		state = info.State.Status
		status = info.State.Status
		if info.State.Running {
			status = fmt.Sprintf("%s (running)", status)
		}
	}

	ports := []ContainerPort{}
	if info.NetworkSettings != nil {
		ports = formatPorts(info.NetworkSettings.Ports)
	}

	created := parseCreated(info.Created)
	if created == 0 && fallbackCreated > 0 {
		created = fallbackCreated
	}

	return Container{
		ID:      info.ID,
		Name:    name,
		Image:   image,
		State:   state,
		Status:  status,
		Ports:   ports,
		Metrics: metrics,
		Envs:    getContainerEnvs(info),
		Host:    hostName(),
		Created: created,
	}
}

func buildContainerFallback(msg events.Message) Container {
	attrs := msg.Actor.Attributes
	name := attrs["name"]
	if name == "" {
		name = "-"
	}

	return Container{
		ID:      msg.Actor.ID,
		Name:    name,
		Image:   attrs["image"],
		State:   stateFromAction(string(msg.Action)),
		Status:  string(msg.Action),
		Ports:   []ContainerPort{},
		Envs:    []EnvironmentVariable{},
		Host:    hostName(),
		Created: msg.Time,
	}
}

func (a *Agent) imagePayload(ctx context.Context, msg events.Message) (*Image, error) {
	if msg.Actor.ID == "" {
		return nil, fmt.Errorf("image event missing id")
	}

	info, _, err := a.cli.ImageInspectWithRaw(ctx, msg.Actor.ID)
	if err != nil {
		fallback := buildImageFallback(msg)
		return &fallback, nil
	}

	containers, err := a.cli.ContainerList(ctx, container.ListOptions{All: true})
	if err != nil {
		containers = nil
	}

	image := imageFromInspect(info, containers)
	return &image, nil
}

func imageFromInspect(info image.InspectResponse, containers []container.Summary) Image {
	var containersWithImage []ImageContainer

	for _, container := range containers {
		if container.ImageID != info.ID {
			continue
		}
		containersWithImage = append(containersWithImage, ImageContainer{
			ID:    shortID(container.ID),
			Name:  strings.TrimPrefix(firstName(container.Names), "/"),
			State: container.State,
		})
	}

	var layers *int
	if info.RootFS.Layers != nil {
		count := len(info.RootFS.Layers)
		if count > 0 {
			layers = &count
		}
	}

	firstTag := firstName(info.RepoTags)

	return Image{
		ID:           shortID(info.ID),
		Name:         getImageName(firstTag),
		Tags:         getImageTags(info.RepoTags),
		Size:         info.Size,
		Layers:       layers,
		OS:           info.Os,
		Architecture: info.Architecture,
		Registry:     "docker.io",
		Containers:   containersWithImage,
	}
}

func buildImageFallback(msg events.Message) Image {
	attrs := msg.Actor.Attributes
	name := attrs["name"]
	if name == "" {
		name = attrs["repo"]
	}

	return Image{
		ID:           shortID(msg.Actor.ID),
		Name:         getImageName(name),
		Tags:         getImageTags([]string{name}),
		Size:         0,
		Layers:       nil,
		OS:           "",
		Architecture: "",
		Registry:     "docker.io",
		Containers:   []ImageContainer{},
	}
}

func getContainerEnvs(info container.InspectResponse) []EnvironmentVariable {
	if info.Config == nil || len(info.Config.Env) == 0 {
		return []EnvironmentVariable{}
	}

	envs := make([]EnvironmentVariable, 0, len(info.Config.Env))
	for _, item := range info.Config.Env {
		parts := strings.SplitN(item, "=", 2)
		key := parts[0]
		value := ""
		if len(parts) > 1 {
			value = parts[1]
		}
		if key == "" || value == "" {
			continue
		}
		envs = append(envs, EnvironmentVariable{Key: key, Value: value})
	}

	return envs
}

func formatPorts(ports nat.PortMap) []ContainerPort {
	if len(ports) == 0 {
		return []ContainerPort{}
	}

	result := make([]ContainerPort, 0)
	for port, hostConfigs := range ports {
		privatePort, portType := splitPortSpec(string(port))
		if len(hostConfigs) == 0 {
			result = append(result, ContainerPort{
				IPVersion: "",
				Private:   privatePort,
				Type:      portType,
			})
			continue
		}

		for _, hostConfig := range hostConfigs {
			entry := ContainerPort{
				IPVersion: ipVersion(hostConfig.HostIP),
				Private:   privatePort,
				Type:      portType,
			}
			if hostConfig.HostPort != "" {
				if publicPort, err := strconv.Atoi(hostConfig.HostPort); err == nil {
					entry.Public = &publicPort
				}
			}
			result = append(result, entry)
		}
	}

	return result
}

func splitPortSpec(value string) (int, string) {
	parts := strings.SplitN(value, "/", 2)
	privatePort := 0
	if len(parts) > 0 && parts[0] != "" {
		if parsed, err := strconv.Atoi(parts[0]); err == nil {
			privatePort = parsed
		}
	}

	portType := ""
	if len(parts) > 1 {
		portType = parts[1]
	}

	return privatePort, portType
}

func ipVersion(hostIP string) string {
	if hostIP == "0.0.0.0" {
		return "IPv4"
	}

	return "IPv6"
}

func hostName() *string {
	name, err := os.Hostname()
	if err != nil {
		return nil
	}

	return &name
}

func stateFromAction(action string) string {
	switch action {
	case "create":
		return "created"
	case "start", "unpause":
		return "running"
	case "pause":
		return "paused"
	case "restart":
		return "restarting"
	case "stop", "die", "kill", "destroy", "remove", "delete":
		return "exited"
	default:
		return "exited"
	}
}

func parseCreated(value string) int64 {
	if value == "" {
		return 0
	}

	if parsed, err := time.Parse(time.RFC3339Nano, value); err == nil {
		return parsed.Unix()
	}

	if parsed, err := time.Parse(time.RFC3339, value); err == nil {
		return parsed.Unix()
	}

	return 0
}

func (a *Agent) getContainerMetrics(
	ctx context.Context,
	info container.InspectResponse,
) (*ContainerMetrics, error) {
	stats, err := a.getContainerStats(ctx, info.ID)
	if err != nil {
		return nil, err
	}

	cores := getContainerCPUInfo(info)
	cpu := getCPUUsage(stats, cores)
	mem := getMemoryUsage(stats)

	return &ContainerMetrics{
		CPU:    cpu,
		Memory: mem,
	}, nil
}

func (a *Agent) getContainerStats(
	ctx context.Context,
	containerID string,
) (*container.StatsResponse, error) {
	stats, err := a.cli.ContainerStats(ctx, containerID, false)
	if err != nil {
		return nil, err
	}
	defer stats.Body.Close()

	var decoded container.StatsResponse
	if err := json.NewDecoder(stats.Body).Decode(&decoded); err != nil {
		return nil, err
	}

	return &decoded, nil
}

func getContainerCPUInfo(info container.InspectResponse) *float64 {
	if info.HostConfig == nil {
		return nil
	}

	if info.HostConfig.NanoCPUs <= 0 {
		return nil
	}

	cores := float64(info.HostConfig.NanoCPUs) / 1_000_000_000
	return &cores
}

func getCPUUsage(stats *container.StatsResponse, cores *float64) float64 {
	cpuDelta := float64(stats.CPUStats.CPUUsage.TotalUsage -
		stats.PreCPUStats.CPUUsage.TotalUsage)

	systemDelta := float64(stats.CPUStats.SystemUsage - stats.PreCPUStats.SystemUsage)

	cpuCount := float64(stats.CPUStats.OnlineCPUs)
	if cpuCount == 0 {
		cpuCount = float64(len(stats.CPUStats.CPUUsage.PercpuUsage))
	}
	if cpuCount == 0 {
		cpuCount = 1
	}

	cpuPercent := 0.0
	if systemDelta > 0 && cpuDelta > 0 {
		cpuPercent = (cpuDelta / systemDelta) * cpuCount * 100
	}

	if cores != nil && *cores > 0 {
		cpuPercent /= *cores
	}

	if cpuPercent > 100 {
		cpuPercent = 100
	}

	return math.Round(cpuPercent*10) / 10
}

func getMemoryUsage(stats *container.StatsResponse) ContainerMemory {
	cache := uint64(0)
	if stats.MemoryStats.Stats != nil {
		if value, ok := stats.MemoryStats.Stats["cache"]; ok {
			cache = value
		}
	}

	used := stats.MemoryStats.Usage - cache

	return ContainerMemory{
		Used:  used,
		Total: stats.MemoryStats.Limit,
	}
}

func shortID(value string) string {
	trimmed := strings.TrimPrefix(value, "sha256:")
	if len(trimmed) <= 12 {
		return trimmed
	}

	return trimmed[:12]
}

func getImageName(value string) string {
	if value == "" {
		return ""
	}

	parts := strings.Split(value, "/")
	last := parts[len(parts)-1]

	nameParts := strings.SplitN(last, ":", 2)
	return nameParts[0]
}

func getImageTags(tags []string) []string {
	result := make([]string, 0, len(tags))
	for _, tag := range tags {
		parts := strings.Split(tag, "/")
		last := parts[len(parts)-1]
		if last == "" {
			continue
		}
		result = append(result, last)
	}

	return result
}

func firstName(values []string) string {
	if len(values) == 0 {
		return ""
	}

	return values[0]
}
