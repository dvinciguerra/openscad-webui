// globals
x = 0;
y = 0;
z_offset = 0.0;

$fn_cylinder = 40;
bit_diameter = 4.5;             // bit hole diameter
bit_radius = bit_diameter / 2;
bit_depth = 40;                 // bit hole height

cols = 12;                      // holes by line
rows = 2;                       // number of lines
spacing_x = 6;                  // spacing between bit holes
spacing_y = 6;                  // spacing between lines

margin = 4;                     // bit holes side margin
base_height = 12;
base_depth = (rows - 1) * spacing_y + 2 * margin;
base_width = (cols - 1) * spacing_x + 2 * margin;

// base
module base(size = [base_width, base_depth, base_height]) {
  difference() {
    translate([x, y, z_offset])
      cube([size[0], size[1], size[2]]);

    side_cut_w = base_width / 1.2;
    side_cut_h = base_height / 3;
    
    minkowski() {
      translate([(base_width - side_cut_w) / 2, -1.40, (base_height - side_cut_h) / 2])
        cube([side_cut_w, 1, side_cut_h]);
        sphere(r=0.6, $fn=40);
    }
    minkowski() {
      translate([(base_width - side_cut_w) / 2, base_depth + 0.40, (base_height - side_cut_h) / 2])
        cube([side_cut_w, 1, side_cut_h]);
        sphere(r=0.6, $fn=40);
    }
  }
}

// bit holes
module bit_holes(cols = 12, rows = 2) {
  // calculate and add lines
  for (row = [0 : rows - 1]) {
    
    // calculate and add bit holes
    for (col = [0 : cols - 1]) {
      x = margin + col * spacing_x;
      y = margin + row * spacing_y;
      translate([x, y, 1.5])
        cylinder(h = bit_depth, r = bit_radius, $fn = $fn_cylinder);
    }
  }
}

// base with holes
difference() {
  base();
  bit_holes(cols, rows);
}
