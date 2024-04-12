export const priceLevelBadge = (priceLevel: number) => {
  return (
    <div className="badge badge-neutral font-mono ">
      <div className={"font-bold  " + (priceLevel >= 0 ? "" : "opacity-25")}>
        $
      </div>
      <div className={"font-bold " + (priceLevel >= 1 ? "" : "opacity-25")}>
        $
      </div>
      <div className={"font-bold " + (priceLevel >= 2 ? "" : "opacity-25")}>
        $
      </div>
      <div className={"font-bold " + (priceLevel >= 3 ? "" : "opacity-25")}>
        $
      </div>
      <div className={"font-bold " + (priceLevel >= 4 ? "" : "opacity-25")}>
        $
      </div>
    </div>
  );
};
