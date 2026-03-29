import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { eventService } from "../services/event.service";

export const eventsRouter = router({
  list: publicProcedure
    .input(z.object({
      status: z.string().max(50).optional(),
      city: z.string().max(100).optional(),
      search: z.string().max(200).optional(),
    }).optional())
    .query(({ input }) => eventService.list(input ?? undefined)),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => eventService.getById(input.id)),

  getDetail: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => eventService.getDetail(input.id)),

  zones: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(({ input }) => eventService.listZones(input.eventId)),

  units: publicProcedure
    .input(z.object({
      eventId: z.number(),
      zoneId: z.number().optional(),
      status: z.string().max(50).optional(),
      type: z.string().max(50).optional(),
    }))
    .query(({ input }) => {
      const { eventId, ...filters } = input;
      return eventService.listUnits(eventId, filters);
    }),

  unitDetail: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => eventService.getUnit(input.id)),

  venues: publicProcedure.query(() => eventService.listVenues()),

  reviews: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(({ input }) => eventService.listReviews(input.eventId)),
});
