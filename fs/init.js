load('api_config.js');
load('api_rpc.js');
load('api_dht.js');
load('api_timer.js');
load('api_gpio.js');
load('api_ili9341_spi.js');

let getFont = ffi('void* get_font()');
let dis = ILI9341;

let pos = [0,0]; // First Page | First Parameter
let pages = [];
let data = load('data.json');
// Display variable
let offset = 50;       // Offset X

/**
 * Buttons
 */
let lag = 200;
// Button A
GPIO.set_button_handler(32, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, lag, function(x) {
  print('Button press, pin: ', x);
  if (pos[0] < pages.length){
    pos[0] = pos[0] +1;
    pos[1] = 0;
    init_gui ();
  }
}, null);
// Button B
GPIO.set_button_handler(33, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, lag, function(x) {
  print('Button press, pin: ', x);
  if (pos[0] >= 0){
    pos[0] = pos[0] -1;
    pos[1] = 0;
    init_gui();
  }
}, null);

// Button Arraow UP
GPIO.set_button_handler(34, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, lag, function(x) {
  print('Button press, pin: ', x);
  focus_parameter(-1);
}, null);

// Button Arraow DOWN
GPIO.set_button_handler(35, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, lag, function(x) {
  print('Button press, pin: ', x);
  focus_parameter(1);
}, null);


/**
 * Data Handling
 */

 function parseData(){
  for(let i = 0; i < data.length; i++){
    if (data[i].type === 'page'){
      pages.push({name: data[i].name, components: data[i].components});
    }
  } 
  // parms
  let p_l = pages.length;
  for (let p = 0; p < p_l; p++) {
    let c_l = pages[p].components.length;
    pages[p].pos = [];
    for (let c = 0; c < c_l; c++) {
      for (let d = 0; d < data.length; d++) {
        if (data[d]._id === pages[p].components[c]) {
          pages[p].pos.push(data[d]);
        }
      }
    }
  }
  // remove Data
  data = null;
}

/**
 * GUI
 */

// Background Color
function setBg(){
  dis.setFgColor565(dis.BLACK);
  dis.fillScreen();
}

// Selection of Parameter
function focus_parameter(p){
  let len = pages[pos[0]].components.length;
  print('focus parameter', p, pos[1], len);
  pos[1] = pos[1] + p;

  if (pos[1] >= len){
    pos[1] = len -1;
  }
  if (pos[1] <= 0){
    pos[1]  = 0;
  }

  for (let i = 0; i < len; i++) {
    dis.setFgColor565(dis.BLACK);
    if (i === pos[1]){
      dis.setFgColor565(dis.GREEN);
    }
    let p2 = 30*i + offset -10; 
    dis.fillRect(2,p2,3,p2+20);
  }
}


// Create Title
function title(name, active, x,y,w,h){
  let x2 = x+w;
  let y2 = y+h;

  if(active === true){
    dis.setFgColor565(dis.GREEN); 
    let thick = 3;  
    dis.fillRect(x,y+h,w -10, thick);
  }
  dis.setFgColor565(dis.WHITE); 
  dis.setFont(getFont());
  dis.print(x, y,name);
}

// Crate Parameter List
function list_parm(p, name, value){
  dis.setFgColor565(dis.WHITE); 
  dis.setFont(getFont());
  let p2 = 30*p + offset; 
  dis.print(10,p2,name);
  dis.print(200,p2,value);
  // line
  dis.setFgColor565(dis.DARKGREY); 
  dis.fillRect(10,p2+20,320, 2);
}

// init GUI
function init_gui (){
  // Clean
  setBg();
  // Create title
  title(pages[pos[0]].name, true, 10, 20,310,20);

  // New List
  let c_l = pages[pos[0]].components.length;
  for (let i = 0; i < c_l; i++) {
    list_parm(i, pages[pos[0]].pos[i].name, pages[pos[0]].pos[i].value);
  }

  // Activ parm
  focus_parameter(0);

}

parseData();
init_gui();