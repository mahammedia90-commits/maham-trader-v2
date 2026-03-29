import * as db from "../db";
import { NotFoundError } from "../lib/errors";

export const eventService = {
  async list(filters?: { status?: string; city?: string; search?: string }) {
    return db.listEvents(filters);
  },

  async getById(eventId: number) {
    const event = await db.getEventById(eventId);
    if (!event) throw new NotFoundError("Event", eventId);
    return event;
  },

  async getDetail(eventId: number) {
    const event = await db.getEventById(eventId);
    if (!event) throw new NotFoundError("Event", eventId);
    const venue = await db.getVenueById(event.venueId);
    const zones = await db.listZonesByEvent(eventId);
    const units = await db.listUnitsByEvent(eventId);
    return { event, venue, zones, units };
  },

  async listZones(eventId: number) {
    return db.listZonesByEvent(eventId);
  },

  async listUnits(eventId: number, filters?: { zoneId?: number; status?: string; type?: string }) {
    return db.listUnitsByEvent(eventId, filters);
  },

  async getUnit(unitId: number) {
    const unit = await db.getUnitById(unitId);
    if (!unit) throw new NotFoundError("Unit", unitId);
    return unit;
  },

  async listVenues() {
    return db.listVenues();
  },

  async listReviews(eventId: number) {
    return db.listReviewsByEvent(eventId);
  },
};
