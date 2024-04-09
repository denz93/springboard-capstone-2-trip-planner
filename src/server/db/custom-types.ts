import { customType } from "drizzle-orm/pg-core";
export const latitude = customType<{ data: number }>({
  dataType() {
    return "numeric(8, 6)";
  }
});

export const longitude = customType<{ data: number }>({
  dataType() {
    return "numeric(9,6)";
  }
});
