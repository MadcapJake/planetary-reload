# Planetary Reload

Description here

## Game Loop

Every 10 seconds, the planetary reload recharges every soldier's laser gun. Each gun has limited charges and must wait, there are no ammo carts. I think I might allow soldiers to pick up fallen
combatants' laser guns.

Every minute (6 reloads), a lander drops with additional soldiers to replace fallen region guards and squads of assault soldiers that engage on surrounding enemy regions.

## Map

The map will be 20 regions wide and 20 regions tall. The territory manager each update will check regions for soldier counts. The region belongs to the faction with the most soldiers. If a region does not contain any soldiers it remains in the current faction's control.

## Factions

Each faction manager each update will send 1 region guard to any region without a guard. Additionally, 2 soldiers are sent to each region bordering the faction's controlled regions. These soldiers have the assault objective.

## Objectives

### Patrol
The soldier has a target region and walks in a random pattern around their region performing detection checks.

### Assault
The soldier has a target region to attack and moves towards that target. Once in range, performs detection checks. Once all detection checks return null, switches to patrol objective in that region.