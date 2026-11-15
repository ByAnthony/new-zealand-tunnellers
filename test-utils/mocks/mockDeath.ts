import { mockDeath } from "@/test-utils/mocks/mockTunneller";
import { Death } from "@/types/tunneller";

export const mockAfterWarDeath: Death = {
  ...mockDeath,
  warInjuriesDeathAfterWar: true,
};
