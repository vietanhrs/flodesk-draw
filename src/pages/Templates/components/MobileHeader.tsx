import { Select } from "@flodesk/grain";
import { useNavigate } from "react-router-dom";

import { ALL_CATEGORY_ID, categories } from "@src/data/categories";
import { FlodeskLogo } from "@src/shared";

interface MobileHeaderProps {
  activeCategoryId: string;
}

export const MobileHeader = ({ activeCategoryId }: MobileHeaderProps) => {
  const navigate = useNavigate();

  const options = categories.map((c) => ({ value: c.id, content: c.label }));

  return (
    <>
      <div className="xl:hidden flex flex-col gap-6 pt-0">
        <FlodeskLogo className="self-start pb-10" />
        <h2 className="font-flodesk text-shade13 text-3xl font-medium leading-tight m-0">
          What's your goal?
        </h2>
      </div>
      <div className="xl:hidden sticky top-0 z-10 -mx-4 px-4 py-2 bg-background mt-3 mb-4">
        <Select
          aria-label="Filter templates by category"
          options={options}
          value={activeCategoryId}
          onChange={(option) => {
            if (option.value === ALL_CATEGORY_ID) {
              navigate("/templates");
            } else {
              navigate(`/templates?category=${option.value}`);
            }
          }}
        />
      </div>
    </>
  );
};
