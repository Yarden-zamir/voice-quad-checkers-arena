// Check all possible winning combinations in 3D space
export const checkWin = (markers: number[][][], player: number): boolean => {
  // Check horizontal lines (along z)
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      if (markers[x][y].every(val => val === player)) {
        return true;
      }
    }
  }

  // Check vertical lines (along y)
  for (let x = 0; x < 4; x++) {
    for (let z = 0; z < 4; z++) {
      if (markers[x].every(row => row[z] === player)) {
        return true;
      }
    }
  }

  // Check depth lines (along x)
  for (let y = 0; y < 4; y++) {
    for (let z = 0; z < 4; z++) {
      if (markers.every(plane => plane[y][z] === player)) {
        return true;
      }
    }
  }

  // Check diagonals in each plane
  for (let x = 0; x < 4; x++) {
    // Main diagonal (\)
    if (markers[x][0][0] === player &&
        markers[x][1][1] === player &&
        markers[x][2][2] === player &&
        markers[x][3][3] === player) {
      return true;
    }
    // Counter diagonal (/)
    if (markers[x][0][3] === player &&
        markers[x][1][2] === player &&
        markers[x][2][1] === player &&
        markers[x][3][0] === player) {
      return true;
    }
  }

  // Check 3D diagonals
  // Main diagonal through cube
  if (markers[0][0][0] === player &&
      markers[1][1][1] === player &&
      markers[2][2][2] === player &&
      markers[3][3][3] === player) {
    return true;
  }
  
  // Other main 3D diagonals
  if (markers[0][0][3] === player &&
      markers[1][1][2] === player &&
      markers[2][2][1] === player &&
      markers[3][3][0] === player) {
    return true;
  }
  
  if (markers[0][3][0] === player &&
      markers[1][2][1] === player &&
      markers[2][1][2] === player &&
      markers[3][0][3] === player) {
    return true;
  }
  
  if (markers[0][3][3] === player &&
      markers[1][2][2] === player &&
      markers[2][1][1] === player &&
      markers[3][0][0] === player) {
    return true;
  }

  return false;
};
