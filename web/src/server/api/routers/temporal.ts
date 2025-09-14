import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const temporalRouter = createTRPCRouter({
  getCurrentTime: publicProcedure.query(async () => {
    return {
      currentTime: new Date().toISOString(),
      dayOfWeek: new Date().getDay(),
      hour: new Date().getHours(),
    };
  }),

  getTimeContext: publicProcedure.query(async () => {
    const hour = new Date().getHours();
    let timeOfDay = "morning";

    if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
    else if (hour >= 17 && hour < 21) timeOfDay = "evening";
    else if (hour >= 21 || hour < 6) timeOfDay = "night";

    return {
      timeOfDay,
      isWeekend: [0, 6].includes(new Date().getDay()),
      mood: "neutral",
    };
  }),
});
