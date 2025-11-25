import { ImagesTable } from "@/components/images/table/images-table";
import { logger } from "@/lib/logger";
import { listImages } from "@/lib/services/images.service";

export default async function Page() {
  const { data, error } = await listImages();

  if (error) {
    logger.error(error);
    throw new Error(error.statusText);
  }

  return <ImagesTable data={data} />;
}
