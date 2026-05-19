import { Box, Select, Stack, Text } from "@flodesk/grain";
import { useNavigate } from "react-router-dom";

import { ALL_CATEGORY_ID, categories } from "@src/data/categories";
import { openFlodeskFile } from "@src/pages/Editor/exporter/flodeskFile";
import { FlodeskLogo } from "@src/shared";

interface MobileHeaderProps {
  activeCategoryId: string;
}

const SCRATCH_VALUE = "__start-from-scratch";
const OPEN_FILE_VALUE = "__open-from-file";

export const MobileHeader = ({ activeCategoryId }: MobileHeaderProps) => {
  const navigate = useNavigate();

  const options = [
    ...categories.map((c) => ({ value: c.id, content: c.label })),
    { value: SCRATCH_VALUE, content: "Start from scratch" },
    { value: OPEN_FILE_VALUE, content: "Open from file" },
  ];

  const handleOpenFromFile = async () => {
    try {
      const result = await openFlodeskFile();
      if (!result) return;
      void navigate("/editor", { state: { loadedFile: result } });
    } catch {
      // Mobile picker can't show inline errors; silently ignore so the user
      // can try again. Desktop sidebar surfaces the message instead.
    }
  };

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
            } else if (option.value === OPEN_FILE_VALUE) {
              void handleOpenFromFile();
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
