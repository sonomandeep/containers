import { ContainersTable } from "@/components/containers/table/containers-table";
import ImagesDispatcher from "@/components/dispatcchers/images-dispatcher";
import { logger } from "@/lib/logger";
import { listContainers } from "@/lib/services/containers.service";
import { listImages } from "@/lib/services/images.service";

export default async function Page() {
  const containers = await listContainers();
  const images = await listImages();

  if (containers.error) {
    logger.error(containers.error);
    throw new Error(containers.error.statusText);
  }

  if (images.error) {
    logger.error(images.error);
    throw new Error(images.error.statusText);
  }

  return (
    <>
      <ImagesDispatcher images={images.data} />
      <ContainersTable data={containers.data} />
    </>
  );
}
