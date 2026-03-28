import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

export const eventsRouter = router({
  // List all events (public - traders can browse without login)
  list: publicProcedure
    .input(z.object({
      status: z.string().optional(),
      city: z.string().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      return db.listEvents(input ?? undefined);
    }),

  // Get single event by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const event = await db.getEventById(input.id);
      if (!event) throw new Error("Event not found");
      return event;
    }),

  // Get event with venue info
  getDetail: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const event = await db.getEventById(input.id);
      if (!event) throw new Error("Event not found");
      const venue = await db.getVenueById(event.venueId);
      const eventZones = await db.listZonesByEvent(input.id);
      const eventUnits = await db.listUnitsByEvent(input.id);
      return { event, venue, zones: eventZones, units: eventUnits };
    }),

  // List zones for an event
  zones: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      return db.listZonesByEvent(input.eventId);
    }),

  // List units for an event with filters
  units: publicProcedure
    .input(z.object({
      eventId: z.number(),
      zoneId: z.number().optional(),
      status: z.string().optional(),
      type: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { eventId, ...filters } = input;
      return db.listUnitsByEvent(eventId, filters);
    }),

  // Get single unit detail
  unitDetail: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const unit = await db.getUnitById(input.id);
      if (!unit) throw new Error("Unit not found");
      return unit;
    }),

  // List venues (public)
  venues: publicProcedure.query(async () => {
    return db.listVenues();
  }),

  // Get reviews for an event (public)
  reviews: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      return db.listReviewsByEvent(input.eventId);
    }),
});
