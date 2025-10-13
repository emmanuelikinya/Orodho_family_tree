import { useCallback, useState, useMemo, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Download } from 'lucide-react';

import PersonNode from './PersonNode';
import PersonDetail from './PersonDetail';
import EditPersonModal from './EditPersonModal';
import AddChildModal from './AddChildModal';
import AddSpouseModal from './AddSpouseModal';
import { transformToFlowData } from '../utils/familyTreeUtils';

const nodeTypes = {
  personNode: PersonNode,
};

const FamilyTree = ({ familyMembers: initialFamilyMembers }) => {
  const [familyMembers, setFamilyMembers] = useState(initialFamilyMembers);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [editingPerson, setEditingPerson] = useState(null);
  const [addingChildTo, setAddingChildTo] = useState(null);
  const [addingSpouseTo, setAddingSpouseTo] = useState(null);

  // Callbacks for node actions
  const handleEdit = useCallback((person) => {
    setEditingPerson(person);
  }, []);

  const handleAddChild = useCallback((person) => {
    setAddingChildTo(person);
  }, []);

  const handleAddSpouse = useCallback((person) => {
    setAddingSpouseTo(person);
  }, []);

  // Load saved positions from localStorage
  const loadSavedPositions = useCallback(() => {
    try {
      const saved = localStorage.getItem('familyTreePositions');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading positions:', error);
      return {};
    }
  }, []);

  // Save positions to localStorage
  const savePositions = useCallback((nodes) => {
    try {
      const positions = nodes.reduce((acc, node) => {
        acc[node.id] = { x: node.position.x, y: node.position.y };
        return acc;
      }, {});
      localStorage.setItem('familyTreePositions', JSON.stringify(positions));
    } catch (error) {
      console.error('Error saving positions:', error);
    }
  }, []);

  // Transform family data to React Flow format with saved positions
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => {
      const data = transformToFlowData(familyMembers);
      const savedPositions = loadSavedPositions();

      // Attach callbacks to each node and apply saved positions if available
      return {
        nodes: data.nodes.map(node => ({
          ...node,
          position: savedPositions[node.id] || node.position,
          data: {
            ...node.data,
            onEdit: handleEdit,
            onAddChild: handleAddChild,
            onAddSpouse: handleAddSpouse,
          },
        })),
        edges: data.edges,
      };
    },
    [familyMembers, handleEdit, handleAddChild, handleAddSpouse, loadSavedPositions]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Save positions whenever nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      savePositions(nodes);
    }
  }, [nodes, savePositions]);

  // Update nodes when family members change (preserving saved positions)
  useEffect(() => {
    const data = transformToFlowData(familyMembers);
    const savedPositions = loadSavedPositions();

    setNodes(data.nodes.map(node => ({
      ...node,
      position: savedPositions[node.id] || node.position,
      data: {
        ...node.data,
        onEdit: handleEdit,
        onAddChild: handleAddChild,
        onAddSpouse: handleAddSpouse,
      },
    })));
    setEdges(data.edges);
  }, [familyMembers, setNodes, setEdges, handleEdit, handleAddChild, handleAddSpouse, loadSavedPositions]);

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedPerson(node.data);
  }, []);

  // Save edited person
  const handleSaveEdit = useCallback((updatedPerson) => {
    setFamilyMembers(prev =>
      prev.map(p => p.id === updatedPerson.id ? updatedPerson : p)
    );
    setEditingPerson(null);
  }, []);

  // Save new child
  const handleSaveChild = useCallback((newChild, parent) => {
    // Add the new child to family members
    setFamilyMembers(prev => {
      const updated = [...prev, newChild];

      // Update parent's spouse data to include the new child
      return updated.map(p => {
        if (p.id === parent.id && p.spouses && p.spouses.length > 0) {
          // Add child to the first spouse's children array
          return {
            ...p,
            spouses: p.spouses.map((spouse, index) => {
              if (index === 0) {
                return {
                  ...spouse,
                  children: [...(spouse.children || []), newChild.id],
                };
              }
              return spouse;
            }),
          };
        }
        return p;
      });
    });
    setAddingChildTo(null);
  }, []);

  // Save new spouse
  const handleSaveSpouse = useCallback((newSpouse, person, marriageDate) => {
    // Add the new spouse to family members
    setFamilyMembers(prev => {
      const updated = [...prev, newSpouse];

      // Update person's spouse array to include the new spouse
      return updated.map(p => {
        if (p.id === person.id) {
          const marriageOrder = (p.spouses?.length || 0) + 1;
          return {
            ...p,
            spouses: [
              ...(p.spouses || []),
              {
                spouseId: newSpouse.id,
                marriageDate: marriageDate || null,
                marriageOrder: marriageOrder,
                children: []
              }
            ],
          };
        }
        return p;
      });
    });
    setAddingSpouseTo(null);
  }, []);

  // Download updated JSON
  const handleDownload = useCallback(() => {
    const dataStr = JSON.stringify({ familyMembers }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'familyData.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [familyMembers]);

  // Reset node positions to original layout
  const handleResetPositions = useCallback(() => {
    localStorage.removeItem('familyTreePositions');
    const data = transformToFlowData(familyMembers);
    setNodes(data.nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onEdit: handleEdit,
        onAddChild: handleAddChild,
        onAddSpouse: handleAddSpouse,
      },
    })));
  }, [familyMembers, setNodes, handleEdit, handleAddChild, handleAddSpouse]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.05}
        maxZoom={2}
        defaultViewport={{ x: 100, y: 0, zoom: 0.6 }}
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.data.isDeceased) return '#999';
            return node.data.gender === 'male' ? '#4A90E2' : '#E91E63';
          }}
          style={{
            background: '#f8f8f8',
          }}
        />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      {/* Person Detail Modal */}
      {selectedPerson && (
        <PersonDetail
          person={selectedPerson}
          familyMembers={familyMembers}
          onClose={() => setSelectedPerson(null)}
        />
      )}

      {/* Edit Person Modal */}
      {editingPerson && (
        <EditPersonModal
          person={editingPerson}
          onSave={handleSaveEdit}
          onClose={() => setEditingPerson(null)}
        />
      )}

      {/* Add Child Modal */}
      {addingChildTo && (
        <AddChildModal
          parent={addingChildTo}
          onSave={handleSaveChild}
          onClose={() => setAddingChildTo(null)}
        />
      )}

      {/* Add Spouse Modal */}
      {addingSpouseTo && (
        <AddSpouseModal
          person={addingSpouseTo}
          onSave={handleSaveSpouse}
          onClose={() => setAddingSpouseTo(null)}
        />
      )}

      {/* Action Buttons */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 5,
          display: 'flex',
          gap: '10px',
        }}
      >
        <button
          onClick={handleResetPositions}
          title="Reset all nodes to original positions"
          style={{
            background: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          Reset Layout
        </button>
        <button
          onClick={handleDownload}
          title="Download updated family data"
          style={{
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Download size={18} />
          Save Changes
        </button>
      </div>

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 5,
        }}
      >
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Orodho Family Tree</h3>
        <div style={{ fontSize: '12px', color: '#666' }}>
          <div style={{ marginBottom: '5px' }}>
            <span style={{ color: '#4CAF50' }}>●</span> Living
          </div>
          <div style={{ marginBottom: '5px' }}>
            <span style={{ color: '#666' }}>●</span> Deceased
          </div>
          <div style={{ marginBottom: '5px' }}>
            <span style={{ color: '#4A90E2' }}>●</span> Male
          </div>
          <div style={{ marginBottom: '5px' }}>
            <span style={{ color: '#E91E63' }}>●</span> Female
          </div>
          <div style={{ marginBottom: '5px' }}>
            <span style={{ color: '#ff69b4' }}>─</span> Marriage
          </div>
          <div>
            <span style={{ color: '#000', fontWeight: 'bold' }}>─</span> Parent-Child
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'white',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 5,
          fontSize: '12px',
          color: '#666',
        }}
      >
        <div style={{ fontWeight: '500', marginBottom: '5px' }}>How to use:</div>
        <div>• Click person to view details</div>
        <div>• Click green + to add child</div>
        <div>• Click pink ♥ to add spouse</div>
        <div>• Click blue edit icon to modify</div>
        <div>• Scroll to zoom • Drag to pan</div>
        <div style={{ marginTop: '5px', fontSize: '11px', fontStyle: 'italic' }}>
          Remember to click "Save Changes" button!
        </div>
      </div>
    </div>
  );
};

export default FamilyTree;
