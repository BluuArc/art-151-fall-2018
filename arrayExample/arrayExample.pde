int[] squareNums = { 1, 4, 9, 16, 25, 36 };

void setup () {
  size(displayWidth, displayHeight);

  println(squareNums[3]);
}

void draw () {
  background(0);
  for (int i = 0; i < squareNums.length; ++i) {
    ellipse(squareNums[i] * 20, height / 2, squareNums[i] * 10, squareNums[i] * 10);
  }
}
