import { Box, Select, Stack, Text } from "@flodesk/grain";
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
      <Stack gap="l" className="tpl-mobile">
        <Box alignSelf="start" paddingBottom="xl">
          <FlodeskLogo />
        </Box>
        <Text tag="h2" size="xxl" weight="medium" color="shade13">
          What's your goal?
        </Text>
      </Stack>
      <div className="tpl-mobile__filter">
        <Select
          aria-label="Filter templates by category"
          options={options}
          value={activeCategoryId}
          onChange={(option) => {
            if (option.value === SCRATCH_VALUE) {
              void navigate("/editor");
            } else if (option.value === ALL_CATEGORY_ID) {
              void navigate("/templates");
            } else {
              void navigate(`/templates?category=${option.value}`);
            }
          }}
        />
      </div>
    </>
  );
};
