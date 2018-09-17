function App ($p5) {

  $p5.setup = () => {
    $p5.createCanvas($p5.windowWidth, $p5.windowHeight);
  }

  $p5.draw = () => {
    if ($p5.mouseIsPressed) {
      $p5.fill(0, 0, 255);
    } else {
      $p5.fill(255, 0, 0);
    }
    $p5.stroke(0, 255, 0);
    $p5.strokeWeight(20);
    $p5.ellipse(400, 500, $p5.mouseX, $p5.mouseY);
  }

  $p5.windowResized = () => {
    $p5.resizeCanvas($p5.windowWidth, $p5.windowHeight);
  }
}
