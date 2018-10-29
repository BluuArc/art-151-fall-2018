import processing.video.*;

Movie t1000, t1000_2;
float timer = 0;

void setup() {
  size(640, 540);
  t1000 = new Movie(this, "mercuryT10002.mp4");
  t1000_2 = new Movie(this, "mercuryT10002.mp4");

  t1000.loop();
  t1000_2.loop();

  t1000.speed(2); // play at 2x speed

  timer = millis();
}

void movieEvent(Movie m) {
  m.read();
}

void mousePressed () {
  t1000_2.jump(random(0, t1000_2.duration()));
}

void draw() {
  image(t1000, 0, 0);
  image(t1000_2, 0, 270);
  
  if (millis() - timer >= 2000) {
    t1000_2.jump(random(0, t1000_2.duration()));
    timer = millis();
  }
}
