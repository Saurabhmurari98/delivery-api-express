import { getDistanceKm } from "../utils/distance.js";

const TRAFFIC_ADD_MIN = { low: 0, medium: 5, high: 10 };
const WEATHER_ADD_MIN = { clear: 0, rain: 7, storm: 12 };
const BASE_MIN_PER_KM = 4; 

const BASE_FARE = 30;         
const FARE_PER_KM = 5;         
const TRAFFIC_SURGE = { low: 0, medium: 0, high: 10 };
const WEATHER_SURGE = { clear: 0, rain: 5, storm: 10 };

export function decide(request) {
  const {
    order_location,
    food_ready_time,
    riders,
    weather = "clear",
    traffic = "low",
  } = request;

  if (!order_location?.lat || !order_location?.lng)
    throw new Error("order_location missing/invalid");
  if (!Array.isArray(riders) || riders.length === 0)
    throw new Error("riders missing/empty");

  let best = null;

  for (const rider of riders) {
    if (!rider?.location?.lat || !rider?.location?.lng) continue;

    const dist = getDistanceKm(
      order_location.lat,
      order_location.lng,
      rider.location.lat,
      rider.location.lng
    );

    const score = rider.rating * 10 - dist * 2 - (rider.weekly_earning || 0) / 100;

    if (!best || score > best.score) {
      best = { id: rider.id, distKm: dist, score };
    }
  }

  if (!best) throw new Error("No valid rider with location");

  const timeFromDistance = best.distKm * BASE_MIN_PER_KM;
  const timeTraffic = TRAFFIC_ADD_MIN[traffic] ?? 0;
  const timeWeather = WEATHER_ADD_MIN[weather] ?? 0;
  const estimatedMinutes = Math.round(
    (food_ready_time || 0) + timeFromDistance + timeTraffic + timeWeather
  );

  const price =
    BASE_FARE +
    best.distKm * FARE_PER_KM +
    (TRAFFIC_SURGE[traffic] ?? 0) +
    (WEATHER_SURGE[weather] ?? 0);

  return {
    rider_id: best.id,
    delivery_price: Math.round(price),
    estimated_time: estimatedMinutes,
  };
}
