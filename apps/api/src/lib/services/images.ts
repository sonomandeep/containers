import type { Image, ServiceResponse } from "@containers/shared";
// import * as HttpStatusCodes from "stoker/http-status-codes";
// import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { docker } from "@/lib/agent";

interface PullImageInput {
  registry: string;
  name: string;
  tag: string;
}

export async function pullImage(input: PullImageInput): Promise<ServiceResponse<Image, { message: string; code: number }>> {
  const stream = await docker.pull(`${input.registry}/${input.name}:${input.tag}`);
  await new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err, res) => {
      if (err)
        reject(err);
      else resolve(res);
    });
  });

  const image = docker.getImage(`${input.name}:${input.tag}`);
  const info = await image.inspect();

  const result: Image = {
    id: info.Id,
    repoTags: info.RepoTags ?? [],
    repoDigests: info.RepoDigests ?? [],
    created: Number(info.Created) ?? 0,
    size: info.Size ?? 0,
    virtualSize: info.VirtualSize ?? 0,
  };

  return {
    data: result,
    error: null,
  };

  //   return {
  //     data: null,
  //     error: {
  //       message: HttpStatusPhrases.NOT_FOUND,
  //       code: HttpStatusCodes.NOT_FOUND,
  //     },
  //   };
}
