// Hearts: the only way to heal during a run. A defeated monster sometimes drops one; it
// falls slowly and the guard has to touch it (it can't be shot open like a chest).
export const HEART = {
  chance: 0.008, // per monster defeated...
  lowHp: 0.35, // ...doubled while the guard is below 35% health
  lowHpMult: 2,
  cooldown: 25, // seconds between two hearts
  maxOnScreen: 1,
  heal: 0.15, // share of max HP (Nightmare levels set their own)
  minHeal: 15,
  fall: 55, // px per second
  scale: 3,
};
