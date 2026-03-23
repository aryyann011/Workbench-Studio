import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge, Position } from 'reactflow';

const elk = new ELK();

const NODE_WIDTH = 250;
const NODE_HEIGHT = 80;

export const getLayoutedElements = async (node : Node[], edges : Edge[]) => {
    const graph = {
        id : 'root',
        layoutOptions : {
            'elk.algorithm' : 'layered',
            'elk.direction' : 'DOWN',
            'elk.spacing.nodeNode' : '75',
            'elk.layered.spacing.nodeNodeBetweenLayers' : '100',
        }
    }
}