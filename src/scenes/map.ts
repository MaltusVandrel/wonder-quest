import * as Phaser from "phaser";
import mapData from "../data/map-data.json";
import mapDefinitions from "../data/map-definitions.json";
export class MapScene extends Phaser.Scene {
    textStyle:Phaser.Types.GameObjects.Text.TextStyle= {
        font: '10px Courier',
        color: '#000000'
    };
    
    size:number=50;
    offset:number=this.size/2;
    map:any=[];
    player:Phaser.GameObjects.Ellipse|undefined;
    
    tileLayer:Phaser.GameObjects.Layer|undefined;
    pathLayer:Phaser.GameObjects.Layer|undefined;
    playerLayer:Phaser.GameObjects.Layer|undefined;
    textLayer:Phaser.GameObjects.Layer|undefined;
    
    mapHeight=[];
    lockPath:boolean=false;
    invalidCellCost=9999999;
    
    constructor (config:string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }
    
    create (){
        this.map=[];
        this.tileLayer=this.add.layer();
        this.pathLayer=this.add.layer();
        this.playerLayer=this.add.layer();
        this.textLayer=this.add.layer();
        for(let y=0;y<mapData.length;y++){
            let mapLine = mapData[y];
            this.map[y]=[];
            for(let x=0;x<mapLine.length;x++){
                let mapCell:number = mapLine[x];
                this.doMapCell(x,y,mapCell);
            } 
        }
        this.doPlayer();
    }
    calculatePath(x:number,y:number):void{
        let targetCellCost={...mapDefinitions}[mapData[y][x]]?.cost;
        if(targetCellCost==null||targetCellCost>=this.invalidCellCost)return;
        let maximumTiles=mapData.length*mapData[0].length;
        let cautionException=100000-1;
        let originalX=this.player?.getData('x');
        let originalY=this.player?.getData('y');
        let pX=this.player?.getData('x');
        let pY=this.player?.getData('y');
        
        let steps=[];
        let uncoveredCells:any=[];
        let directions:any=[];
        directions.push([-1,-1]);
        directions.push([+0,-1]);
        directions.push([+1,-1]);
        directions.push([-1,+0]);
        directions.push([+1,+0]);
        directions.push([-1,+1]);
        directions.push([+0,+1]);
        directions.push([+1,+1]);               
       
        uncoveredCells[originalX+';'+originalY]=
            {cost:(Math.abs(originalX-x)+Math.abs(originalY-y)),stepped:true};
        steps.push({x:originalX,y:originalY});    
        while(
            (pX!=x||pY!=y)
            &&steps.length<maximumTiles
            &&steps.length<cautionException
        ){
            //uncoverCells
            for(let direction of directions){
                let dX=direction[0];
                let dY=direction[1];
                let sX=pX+dX;
                let sY=pY+dY;
                if(!(sX>=0&&sX<mapData.length))continue;
                if(!(sY>=0&&sY<mapData.length))continue;
                let cost={...mapDefinitions}[mapData[sY][sX]]?.cost;
                if(!uncoveredCells[sX+';'+sY]){
                    let baseCost=Math.sqrt(Math.abs(dX)+Math.abs(dY));//G
                    let cellCost=cost!=undefined?cost:0;//peso 
                    let pathCost=Math.abs(sX-x)+Math.abs(sY-y);//H 
                    let totalCost=baseCost+pathCost+cellCost;
                    uncoveredCells[sX+';'+sY]={cost:totalCost,stepped:false,x:sX,y:sY};
                }
            }

            //chooseLowerCost
            let keys=Object.keys(uncoveredCells);
            let lowestPath={cost:9999,key:null,x:null,y:null};
            for(let i=0;i<keys.length;i++){
                let key=keys[i];
                let cell=uncoveredCells[key];
                if(cell.stepped)continue;
                if(cell.cost<lowestPath.cost){
                    lowestPath=cell;
                }
            }

            //stepOnLowerCost
            pX=lowestPath.x;
            pY=lowestPath.y;
            uncoveredCells[pX+";"+pY].stepped=true;
            steps.push({x:pX,y:pY});
        }
        console.log("#======START=======#")
        let first=true;
       
        this.pathLayer?.getAll().forEach(element => {
           element.destroy(); 
        });
        for(let i=1;i<steps.length;i++){
            let lastStep=steps[i-1];
            let step=steps[i];
            let key= step.x+";"+step.y;
            console.log(key);
            /*
            let l =this.add.line(
                lastStep.x*this.size,
                lastStep.y*this.size,
                this.offset,
                this.offset,
                step.x+this.size ,
                step.y+this.size,
                0xffffff
                );
            this.pathLayer?.add(l);    
            */

        }   
        console.log("#==================#")

        let l =this.add.line(
            
            0,
            0,
            originalX*this.size+(this.offset*(originalX-x)),
            originalY*this.size+(this.offset*(originalY-y)),
            x*this.size,
            y*this.size,
            0xffffff
            );
        this.pathLayer?.add(l); 

    }
    movePlayerToCell(x:number,y:number):void{
        let moves=0;
        let maximumTiles=mapData.length*mapData[0].length;
        let cautionException=100000-1;
        let pX=this.player?.getData('x');
        let pY=this.player?.getData('y');

        
        let playerStep=()=>{
            if(pX!=x){
                if(pX>x){
                    pX--;
                }else{
                    pX++;
                }
            }
            if(pY!=y){
                if(pY>y){
                    pY--;
                }else{
                    pY++;
                }
            }
            this.player?.setX(this.size*pX+this.offset);
            this.player?.setY(this.size*pY+this.offset);
            this.player?.setData("x",pX);
            this.player?.setData("y",pY);
            moves++;
            if((
                pX!=x||pY!=y)
                &&moves<maximumTiles
                &&moves<cautionException
            ){
                
                setTimeout(playerStep,90);
            }else{
                this.lockPath=false;
            }
        }
        if((
            pX!=x||pY!=y)
            &&moves<maximumTiles
            &&moves<cautionException
        ){
            this.lockPath=true;
            setTimeout(playerStep,300);

        }
        
    }
    doPlayer(){
        this.player=this.add.ellipse(this.size+this.offset,this.size+this.offset,20,20,0xffff00);
        this.player.setStrokeStyle(2,0x000000);
        this.player.setData({y:1,x:1});
        this.player.setInteractive();
        this.player.addListener("pointerup",()=>{
            this.textLayer?.setVisible(!this.textLayer?.visible);
        })
        this.playerLayer?.add(this.player); 
    }
    doMapCell(x:number,y:number,mapCell:number){
        let defs = {...mapDefinitions}[mapCell];
        if(defs==undefined)defs=mapDefinitions[0];
        let fillColor=parseInt(defs.color,16);
        let cell =this.add.rectangle(x*this.size + this.offset, y*this.size+ this.offset, this.size, this.size, fillColor);
        cell.fillColor=fillColor;
        cell.setInteractive();
        cell.addListener("pointerover", () => { 
            let integer = cell.fillColor;
            let color=this.integerToColor(integer);
            color.brighten(20);
            color.saturate(25);
            cell.fillColor=this.colorToInteger(color);
            cell.setStrokeStyle(2,0xffffff);
            this.calculatePath(x,y);
        })
        cell.addListener("pointerout", () => { cell.fillColor = fillColor; 
            cell.setStrokeStyle(0,0xffffff);
            
        })
        cell.addListener("pointerup",()=>{
            if(!this.lockPath)this.movePlayerToCell(x,y);
        })
        cell.setData({y:y,x:x});
        this.tileLayer?.add(cell);
        this.map[y][x]={...defs,x:x,y:y,element:cell};

    }
    colorToInteger(color:Phaser.Display.Color):number{
        return this.hexToInteger(this.colorToHex(color));
    }
    integerToColor(integer:number):Phaser.Display.Color{
        return this.hexToColor(integer.toString(16));
    }

    channelToHex(channel:number):string {
        var hex = channel.toString(16);
        return ((hex.length === 1) ? "0" + hex : hex);
    }
    rgbToHexString(r:number,g:number,b:number):string{
        return "0x"+this.channelToHex(r)+this.channelToHex(g)+this.channelToHex(b);
    }
    hexToColor(hexColor:string):Phaser.Display.Color{
        return Phaser.Display.Color.ValueToColor(hexColor);
    }
    hexToInteger(hexColor:string):number{
        return parseInt(hexColor,16);
    }
    colorToHex(color:Phaser.Display.Color):string{
        return this.rgbToHexString(color.red,color.green,color.blue);
    }
    
}

