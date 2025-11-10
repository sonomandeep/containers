import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Footer() {
  return (
    <div className="grid grid-cols-3 px-2 pt-2 border-t border-secondary">
      <div>
        <p className="text-muted-foreground">
          Results:
          <span className="text-foreground">&nbsp;1&nbsp;</span>
          -
          <span className="text-foreground">&nbsp;10&nbsp;</span>
          of 22
        </p>
      </div>

      <div className="flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink size="icon-sm" href="#">
                1
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationLink size="icon-sm" href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationLink size="icon-sm" href="#">
                3
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <div className="flex justify-end">
        <Select defaultValue="10">
          <SelectTrigger className="w-[180px]" size="sm">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="10">10 per Page</SelectItem>
              <SelectItem value="25">25 per Page</SelectItem>
              <SelectItem value="50">50 per Page</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
