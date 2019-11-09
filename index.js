const ap = API.getActionPointsCount();
const size = API.getArenaSize();
let { x, y } = API.getCurrentPosition();

const centerCoord = Math.floor(size / 2);
const center = {
  position: {
    x: centerCoord,
    y: centerCoord
  },
  delta: {
    x: centerCoord - x,
    y: centerCoord - y
  }
}

const getDistance = (p1, p2)  =>{
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

const moveIn = (tx, ty) => {
  if (getDistance({ x, y }, { x: tx, y: ty }) > ap) {
    return moveIn({ x, y }, {
      x: (tx - x) === 0 ? tx : (tx - x) > 0 ? tx - 1 : tx + 1,
      y: (ty - y) === 0 ? ty : (ty - y) > 0 ? ty - 1 : ty + 1,
    })
  }

  API.move(tx, ty);
}

const moveToEnemy = (enemy) => {
  moveIn(x + enemy.delta.x, y + enemy.delta.y);
}


const moveToCenter = () => moveToEnemy(center);

(() => {
  const enemies = API.getEnemies().map(enemy => {
    const deltaX = enemy.position.x - x;
    const deltaY = enemy.position.y - y;

    return {
      ...enemy,
      delta: {
        x: deltaX,
        y: deltaY,
      },
      distance: getDistance({x,y}, enemy.position),
    }
  });
  const sortedEnemies = [...enemies].sort((a, b) => a.distance - b.distance);

  const isSafePosition = (coord) => sortedEnemies.every(enemy => {
    const distance = getDistance(coord, enemy.position);

    if (distance === 0) {
      return true;
    }

    return getDistance(coord, enemy.position) > 3;
  });

  const deadEnemy = sortedEnemies.find(enemy => {
    const { distance } = enemy;
    const isSafe = isSafePosition(enemy.position);

    if ((distance <= ap) && isSafe) {
      return true;
    }

    return false;
  })

  if (deadEnemy) {
    return moveToEnemy(deadEnemy);
  }

  let safeIsCurrent = false;
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const coord = { x: i, y: j };
      const canMove = getDistance(coord, { x, y }) <= ap;
      const isSafe = sortedEnemies.every(enemy => {
        const distance = getDistance(coord, enemy.position);

        if (distance === 0) {
          return true;
        }

        return getDistance(coord, enemy.position) > 3;
      });


      if (coord.x === x && coord.y === y) {
        safeIsCurrent = isSafe;
        continue;
      }


      if (isSafe && canMove) {
        return API.move(coord.x, coord.y);
      }
    }
  }

  if (safeIsCurrent) {
    return;
  }

  if (sortedEnemies[0].distance <= ap) {
    return moveToEnemy(sortedEnemies[0]);
  }

  return moveToCenter();
})();
