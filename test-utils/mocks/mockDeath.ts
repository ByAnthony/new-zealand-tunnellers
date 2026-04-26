import { Death } from "@/types/tunneller";

import { mockDeath } from "./mockTunneller";

export const mockAfterWarDeath: Death = {
  ...mockDeath,
  warInjuriesDeathAfterWar: true,
};
