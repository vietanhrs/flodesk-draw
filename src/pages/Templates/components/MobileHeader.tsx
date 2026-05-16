import { Select } from "@flodesk/grain";
import { useNavigate } from "react-router-dom";

import { ALL_CATEGORY_ID, categories } from "@src/data/categories";
import { FlodeskLogo } from "@src/shared";

interface MobileHeaderProps {
  activeCategoryId: string;
}

export const MobileHeader = ({ activeCategoryId }: MobileHeaderProps) => {
  const navigate = useNavigate();

  const SCRATCH_VALUE = "__start-from-scratch";
  const options = [
    ...categories.map((c) => ({ value: c.id, content: c.label })),
    { value: SCRATCH_VALUE, content: "Start from scratch" },
  ];

  return (
    <>
      <div className="tpl-mobile">
        <FlodeskLogo className="tpl-mobile__logo" />
        <h2 className="tpl-mobile__heading">What's your goal?</h2>
      </div>
      <div className="tpl-mobile__filter">
        <Select
          aria-label="Filter templates by category"
          options={options}
          value={activeCategoryId}
          onChange={(option) => {
            if (option.value === SCRATCH_VALUE) {
              navigate("/editor");
            } else if (option.value === ALL_CATEGORY_ID) {
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
