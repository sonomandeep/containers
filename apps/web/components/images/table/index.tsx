import type { Image } from "@containers/shared";
import { columns } from "./columns";
import { DataTable } from "./data-table";

type Props = {
  images: Array<Image>;
};

export function ImagesTable({ images }: Props) {
  return <DataTable columns={columns} data={images} />;
}
