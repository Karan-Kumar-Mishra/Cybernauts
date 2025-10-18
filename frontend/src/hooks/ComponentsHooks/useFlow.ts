import { CustomNode, HighScoreNode, LowScoreNode } from "../../components/CustomNode";
import { useEffect, useCallback } from "react";
import { useNodesState, useEdgesState, useReactFlow } from "reactflow";
import { apiService } from "../../services/apiService";
import toast from "react-hot-toast";
import useApp from "../../contexts/useApp";
import CustomEdge from "../../components/CustomEdge";
import { Edge } from "reactflow";
import { Connection } from "reactflow";

const nodeTypes = {
    default: CustomNode,
    highScore: HighScoreNode,
    lowScore: LowScoreNode,
};
const edgeTypes = {
    custom: CustomEdge,
};

function useFlow() {

    const { state, dispatch } = useApp();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { project } = useReactFlow();
    
    const loadGraphData = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const graphData = await apiService.getGraphData();

            console.log('📥 Loaded graph data from backend:', {
                nodes: graphData.nodes.length,
                edges: graphData.edges.length
            });

            dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });
            setNodes(graphData.nodes);
            setEdges(graphData.edges);

        } catch (error) {
            console.error('Error loading graph data:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load graph data' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };
    const loadUsers = async () => {
        try {
            const users = await apiService.getAllUsers();
            dispatch({ type: 'SET_USERS', payload: users });
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            await Promise.all([loadGraphData(), loadUsers()]);
        };

        initializeData();
    }, []);
    useEffect(() => {
        if (state.nodes.length > 0) {
            console.log('🔄 Syncing React Flow state with global state');
            setNodes(state.nodes);
            setEdges(state.edges);
        }
    }, [state.nodes, state.edges, setNodes, setEdges]);

    const onConnect = useCallback(
        async (params: Connection) => {           
            if (!params.source || !params.target) {
                toast.error('Cannot create connection - missing nodes');
                return;
            }
            if (params.source === params.target) {
                toast.error('Cannot connect a user to themselves');
                return;
            }
            const sourceUser = state.users.find(u => u.id === params.source);
            const targetUser = state.users.find(u => u.id === params.target);
            if (!sourceUser || !targetUser) {
                toast.error('Cannot create connection - users not found');
                return;
            }

            try {
                toast.loading(`Connecting ${sourceUser.username} and ${targetUser.username}...`, {
                    id: 'create-connection'
                });
                await apiService.createRelationship(params.source, params.target);
                await new Promise(resolve => setTimeout(resolve, 1000));
                const [graphData, users] = await Promise.all([
                    apiService.getGraphData(),
                    apiService.getAllUsers()
                ]);
                dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });
                dispatch({ type: 'SET_USERS', payload: users });

                toast.success(`Connected ${sourceUser.username} and ${targetUser.username}! 🎉`, {
                    id: 'create-connection',
                    duration: 4000
                });

            } catch (error: any) {
                if (error.response?.status === 409) {
                    toast.error('Users are already connected!', { id: 'create-connection' });
                } else if (error.response?.status === 404) {
                    toast.error('One or both users not found', { id: 'create-connection' });
                } else {
                    const errorMessage = error.response?.data?.error || error.message || 'Failed to create connection';
                    toast.error(errorMessage, {
                        id: 'create-connection'
                    });
                }
            }
        },
        [state.users, dispatch]
    );

 
    const removeEdge = async (edge: Edge) => {
        
        const sourceUser = state.users.find(u => u.id === edge.source);
        const targetUser = state.users.find(u => u.id === edge.target);

        if (!sourceUser || !targetUser) {
            toast.error('Cannot remove connection - users not found');
            return;
        }

        if (window.confirm(`Remove connection between ${sourceUser.username} and ${targetUser.username}?`)) {
            try {
                toast.loading('Removing connection...', { id: 'remove-connection' });
                await apiService.removeRelationship(edge.source, edge.target);
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('🔄 Refreshing data after removal...');
                const [graphData, users] = await Promise.all([
                    apiService.getGraphData(),
                    apiService.getAllUsers()
                ]);
                dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });
                dispatch({ type: 'SET_USERS', payload: users });
                setNodes(graphData.nodes);
                setEdges(graphData.edges);
                toast.success(`Connection removed between ${sourceUser.username} and ${targetUser.username}!`, {
                    id: 'remove-connection',
                    duration: 4000
                });
            } catch (error: any) {
                toast.error('Failed to remove connection', { id: 'remove-connection' });
            }
        }
    };


    const onEdgeDoubleClick = useCallback(
        async (event: React.MouseEvent, edge: Edge) => {
            event.stopPropagation();
            await removeEdge(edge);
        },
        [state.users, dispatch, setNodes, setEdges]
    );


    const onEdgeClick = useCallback(
        async (event: React.MouseEvent, edge: Edge) => {
            event.stopPropagation();
            console.log('🖱️ Edge clicked:', edge);

            // If shift key is pressed, remove immediately
            if (event.shiftKey) {
                await removeEdge(edge);
            }
        },
        [state.users, dispatch, setNodes, setEdges]
    );

  
    const onEdgeContextMenu = useCallback(
        async (event: React.MouseEvent, edge: Edge) => {
            event.preventDefault();
            event.stopPropagation();

            const sourceUser = state.users.find(u => u.id === edge.source);
            const targetUser = state.users.find(u => u.id === edge.target);

            if (sourceUser && targetUser) {
                const remove = window.confirm(
                    `Remove connection between ${sourceUser.username} and ${targetUser.username}?`
                );

                if (remove) {
                    await removeEdge(edge);
                }
            }
        },
        [state.users, dispatch, setNodes, setEdges]
    );

  
    useEffect(() => {
        const handleEdgeDelete = async (event: CustomEvent) => {
            const { edgeId } = event.detail;
            const edgeToDelete = edges.find(edge => edge.id === edgeId);
            if (edgeToDelete) {
                await removeEdge(edgeToDelete);
            }
        };
        window.addEventListener('edgeDelete', handleEdgeDelete as EventListener);
        return () => {
            window.removeEventListener('edgeDelete', handleEdgeDelete as EventListener);
        };
    }, [edges, state.users, dispatch, setNodes, setEdges]);


    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if ((event.key === 'Delete' || event.key === 'Backspace') && state.selectedNode) {
                // You can add node deletion logic here if needed
                console.log('Delete key pressed with selected node:', state.selectedNode);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [state.selectedNode]);

    const onConnectStart = useCallback((event: any, params: any) => {
        console.log('🔵 Connection start:', params);
    }, []);

    const onConnectEnd = useCallback((event: any) => {
        console.log('🔴 Connection end:', event);
    }, []);

    const onNodeDragStop = useCallback(async (event: React.MouseEvent, node: Node) => {
        setNodes((nds) =>
            nds.map((n) =>
                n.id === node.id
                    ? { ...n, position: node.position }
                    : n
            )
        );
    }, [setNodes]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        dispatch({ type: 'SET_SELECTED_NODE', payload: node });
    }, [dispatch]);

    const onPaneClick = useCallback((event: React.MouseEvent) => {
        dispatch({ type: 'SET_SELECTED_NODE', payload: null });
    }, [dispatch]);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            console.log('Item dropped on canvas background');
        },
        [project, setNodes]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }, []);

    return {
        nodeTypes, state, onConnect, onConnectEnd, onConnectStart, onDragOver, onEdgeClick,
        onNodeClick, onNodeDragStop, onPaneClick, onDrop, edgeTypes, onEdgeContextMenu, onEdgeDoubleClick,
        nodes, onNodesChange, onEdgesChange, edges
    };
}
export default useFlow;