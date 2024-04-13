import { initData } from "../__tests__/helpers";

async function populate() {
  await initData();
}

console.log("Populating sample data...");
populate()
  .then(() => console.log("Sample data populated"))
  .catch((err) => {
    console.error("Sample data failed to populate", err);
  });
