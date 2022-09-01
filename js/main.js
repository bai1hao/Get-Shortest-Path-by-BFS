let $ =e=> document.querySelector(e);
let container = $('.container');
const CELL_SIZE = 20;
const ROW_SIZE = 20;
const COL_SIZE = 30;
//用于存储单元格对象
let cells = [];
//设置容器宽高
container.style.width = `${COL_SIZE * CELL_SIZE}px`
container.style.height = `${ROW_SIZE * CELL_SIZE}px`
//复制一个grid
let myGrid = JSON.parse(JSON.stringify(grid));
//动画
let animation;
//如果本地有保存的grid则用本地
function getGrid(){
    if(localStorage.getItem('bai1hao.grid')){
        return JSON.parse(localStorage.getItem('bai1hao.grid'));
    }else {
        return myGrid
    }
}
//弹出提示框方法
function alertIt(text){
    $('.alertBg').style.display = 'grid';
    $('.alert-text').innerText = text;
}
//关闭弹窗的点击事件
$('.button-ok').addEventListener('click',e=>{
    $('.alertBg').style.display = 'none'
})
//如果有没有本地存储则清除存储按钮禁用
if(!localStorage.getItem('bai1hao.grid')){
    $('.button-clear').disabled = true;
}
//创建单元格对象
class Cell {
    constructor(id,row,col,tag){
        this.id = id;
        this.row = row;
        this.col = col;
        this.tag = tag;
        this.el = document.createElement('div');
        this.el.style.width = `${CELL_SIZE}px`
        this.el.style.height = `${CELL_SIZE}px`
        this.el.classList.add('cell');
        this.el.setAttribute('data-tag',tag)
        this.el.setAttribute('data-row',row)
        this.el.setAttribute('data-col',col)
        this.el.style.left = `${CELL_SIZE * this.col}px`
        this.el.style.top = `${CELL_SIZE * this.row}px`
        container.appendChild(this.el)
    }
    render(){
        if(this.tag==1){
            this.el.classList.remove('no-road')
            this.el.classList.add('road')
            this.el.innerText = ''
        }else if(this.tag == 0){
            this.el.classList.remove('road')
            this.el.classList.add('no-road')
        }else if(this.tag == 2){
            this.el.innerText = 'S'
            this.el.classList.add('road')
        }else if(this.tag == 3){
            this.el.innerText = 'E'
            this.el.classList.add('road')
        }
    }
    get left(){
        return cells.find(e=>e.row === this.row&&e.col===this.col-1)
    }
    get right(){
        return cells.find(e=>e.row === this.row&&e.col === this.col + 1)
    }
    get top(){
        return cells.find(e=>e.col===this.col&&e.row ===this.row-1)
    }
    get bottom(){
        return cells.find(e=>e.col === this.col && e.row === this.row +1)
    }
    get neighbor(){
        let nei = [this.left,this.right,this.top,this.bottom];
        return nei.filter(e=>e?.tag>0)
    }
}
//加载界面的方法
function load(){
    let id = 0
    cells = []
    container.innerHTML = ''
    getGrid().forEach((aRow,rowIndex)=>{
        aRow.forEach((tag,colIndex)=>{
            let cell = new Cell(id,rowIndex,colIndex,tag)
            cell.render();
            cells.push(cell)
            id++
        })
    })
}
load();

function getPoint(tag){
    return cells.find(e=>e.tag==tag)
}

container.addEventListener('click',e=>{
    let el = e.target;
    let gr = getGrid();
    let row = el.dataset.row
    let col = el.dataset.col
    switch(el.dataset.tag){
        case '0':
            gr[row][col] = 1;
            break;
        case '2':
            gr[row][col] = 1;
            break;
        case '3':
            gr[row][col] = 1;
            break;
        case '1':
            if(getPoint(2)&&getPoint(3)){
                return;
            }else if(getPoint(2)){
                gr[row][col] = 3;
            }else if(getPoint(3)){
                gr[row][col] = 2;
            }else{
                gr[row][col] = 2;
            }
            break;
    }
    localStorage.setItem('bai1hao.grid',JSON.stringify(gr));
    $('.button-clear').disabled = false;
    $('.button-start').disabled = false;
    load();
})

container.addEventListener('contextmenu',e=>{
    $('.button-start').disabled = false;
    $('.button-clear').disabled = false;
    e.preventDefault();
    let el = e.target;
    let gr =  getGrid();
    let row = el.dataset.row
    let col = el.dataset.col
    if(el.dataset.tag==1){
        gr[row][col] = 0;
    }
    localStorage.setItem('bai1hao.grid',JSON.stringify(gr));
    load();
})
//广度算法寻找最短路径
function getPath(){
    let start = cells.find(e=>e.tag == 2)
    let queue = [start]
    let visited = new Map()
    visited.set(start,null)
    for(let currentCell of queue){
        if(currentCell.tag == 3){
            let path = []
            while(currentCell){
                path.push(currentCell)
                currentCell = visited.get(currentCell)
            }
            return path.reverse();
        }

        for(let neighbor of currentCell.neighbor){
            if (visited.has(neighbor)) continue
            queue.push(neighbor)
            visited.set(neighbor,currentCell)
        }
    }
    return -1;
}


$('.button-start').addEventListener('click',e=>{
    e.target.disabled = true;
    let shortPath;
    if(animation){
        clearInterval(animation)
    }
    cells.forEach(e=>e.render())
    if(getPoint(2)&&getPoint(3)){
        shortPath = getPath();
    }else if(getPoint(2)){
        alertIt('You have no end point')
        $('.button-start').disabled = false;
    }else if(getPoint(3)){
        alertIt('You have no start point')
        $('.button-start').disabled = false;
    }else{
        alertIt('You have no start point and end point')
        $('.button-start').disabled = false;
    }
    if(shortPath&&shortPath<0){
        alertIt('no path to the end')
        $('.button-start').disabled = false;
    }else if(shortPath){
        let index = 0
        animation = setInterval(()=>{
            if(index>0&&index<shortPath.length-1)
                shortPath[index].el.innerText = '*'
            if(index===shortPath.length-1){
                clearInterval(animation)
                $('.button-start').disabled = false;
            }
                index++;
        },50)
    }
})
$('.button-reset').addEventListener('click',e=>{
    $('.button-start').disabled = false;
    load()
})
$('.button-clear').addEventListener('click',e=>{
    $('.button-start').disabled = false;
    //清除本地存储
    localStorage.removeItem('bai1hao.grid');
    //从原始数据重新拷贝
    myGrid = JSON.parse(JSON.stringify(grid))
    $('.button-clear').disabled = true;
    load();
})

