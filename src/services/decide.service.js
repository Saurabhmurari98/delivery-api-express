import { getDistanceKm } from "../utils/distance.js";

const BASE_FARE = 30;         
const FARE_PER_KM = 5;         

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

    // ✅ Select by nearest first, rating tie breaker
    if (
      !best ||
      dist < best.distKm ||
      (Math.abs(dist - best.distKm) < 0.2 && rider.rating > best.rating)
    ) {
      best = { id: rider.id, distKm: dist, rating: rider.rating };
    }
  }

  if (!best) throw new Error("No valid rider with location");

  // ✅ Dynamic average speed (km/h)
  let baseSpeed = 25; // normal
  if (traffic === "medium") baseSpeed = 20;
  if (traffic === "high") baseSpeed = 15;

  if (weather === "rain") baseSpeed -= 3;
  if (weather === "storm") baseSpeed -= 7;

  if (baseSpeed < 8) baseSpeed = 8; 

  const timeFromDistance = (best.distKm / baseSpeed) * 60;
  const estimatedMinutes = Math.round(
    (food_ready_time || 0) + timeFromDistance
  );

  const price =
    BASE_FARE +
    best.distKm * FARE_PER_KM +
    (traffic === "high" ? 10 : 0) +
    (weather === "rain" ? 5 : 0) +
    (weather === "storm" ? 10 : 0);

  return {
    rider_id: best.id,
    delivery_price: Math.round(price),
    estimated_time: estimatedMinutes,
  };
}
