import { useCallback, useState, useMemo, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Download, Upload } from 'lucide-react';

import PersonNode from './PersonNode';
import PersonDetail from './PersonDetail';
import EditPersonModal from './EditPersonModal';
import AddChildModal from './AddChildModal';
import AddSpouseModal from './AddSpouseModal';
import { transformToFlowData } from '../utils/familyTreeUtils';
import { saveFamilyDataToGitHub, validateGitHubConfig } from '../utils/githubApi';

const nodeTypes = {
  personNode: PersonNode,
};

const FamilyTreeInner = ({ familyMembers: initialFamilyMembers }) => {
  const { fitView } = useReactFlow();
  const [familyMembers, setFamilyMembers] = useState(initialFamilyMembers);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [editingPerson, setEditingPerson] = useState(null);
  const [addingChildTo, setAddingChildTo] = useState(null);
  const [addingSpouseTo, setAddingSpouseTo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

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
      console.error('Error loading positions from localStorage:', error);
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
      console.log('Positions saved to browser');
    } catch (error) {
      console.error('Error saving positions to localStorage:', error);
    }
  }, []);

  // Transform family data to React Flow format
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => {
      console.log('Transforming family data, members count:', familyMembers?.length);
      const data = transformToFlowData(familyMembers);
      console.log('Transformation complete - Nodes:', data.nodes.length, 'Edges:', data.edges.length);

      // Attach callbacks to each node
      return {
        nodes: data.nodes.map(node => ({
          ...node,
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
    [familyMembers, handleEdit, handleAddChild, handleAddSpouse]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [positionsLoaded, setPositionsLoaded] = useState(false);

  console.log('Current nodes in state:', nodes.length);
  console.log('Current edges in state:', edges.length);

  // Fit view when nodes are loaded
  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 800 });
        console.log('FitView applied to', nodes.length, 'nodes');
      }, 100);
    }
  }, [nodes.length, fitView]);

  // Load positions from localStorage on mount
  useEffect(() => {
    const savedPositions = loadSavedPositions();

    if (Object.keys(savedPositions).length > 0) {
      setNodes(currentNodes =>
        currentNodes.map(node => ({
          ...node,
          position: savedPositions[node.id] || node.position,
        }))
      );
    }
    setPositionsLoaded(true);
  }, [loadSavedPositions, setNodes]);

  // Save positions whenever nodes change (with debouncing)
  useEffect(() => {
    if (!positionsLoaded || nodes.length === 0) return;

    const timeoutId = setTimeout(() => {
      savePositions(nodes);
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [nodes, savePositions, positionsLoaded]);

  // Update nodes when family members change (preserving current positions)
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

  // Save changes to GitHub or download JSON as fallback
  const handleSaveChanges = useCallback(async () => {
    setIsSaving(true);
    setSaveMessage('');

    // Get GitHub configuration from environment variables
    const githubConfig = {
      owner: import.meta.env.VITE_GITHUB_OWNER,
      repo: import.meta.env.VITE_GITHUB_REPO,
      token: import.meta.env.VITE_GITHUB_TOKEN,
    };

    // Validate configuration
    const validation = validateGitHubConfig(githubConfig);

    if (!validation.valid) {
      // Fallback to download if GitHub not configured
      console.warn('GitHub not configured, falling back to download:', validation.message);

      const dataStr = JSON.stringify({ familyMembers }, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = 'familyData.json';

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      setSaveMessage('Downloaded JSON file (GitHub not configured)');
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 5000);
      return;
    }

    // Save to GitHub
    try {
      const result = await saveFamilyDataToGitHub(familyMembers, githubConfig);

      if (result.success) {
        setSaveMessage(result.message);
        console.log('Commit URL:', result.commitUrl);
      } else {
        setSaveMessage(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage('Failed to save changes. Check console for details.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 8000);
    }
  }, [familyMembers]);

  // Reset node positions to original layout
  const handleResetPositions = useCallback(async () => {
    try {
      // Delete positions from server
      await fetch(`${API_URL}/positions`, {
        method: 'DELETE',
      });
      console.log('Positions reset on server');
    } catch (error) {
      console.error('Error resetting positions on server:', error);
    }

    // Also remove from localStorage
    localStorage.removeItem('familyTreePositions');

    // Reset to original layout
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

      {/* Save Status Message */}
      {saveMessage && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            right: '20px',
            zIndex: 6,
            background: saveMessage.includes('Error') || saveMessage.includes('Failed') ? '#f44336' : '#4CAF50',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            maxWidth: '400px',
            fontSize: '14px',
          }}
        >
          {saveMessage}
        </div>
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
          onClick={handleSaveChanges}
          disabled={isSaving}
          title="Save changes to GitHub repository"
          style={{
            background: isSaving ? '#999' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          {isSaving ? <Upload size={18} className="spin" /> : <Download size={18} />}
          {isSaving ? 'Saving...' : 'Save Changes'}
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

const FamilyTree = (props) => {
  return (
    <ReactFlowProvider>
      <FamilyTreeInner {...props} />
    </ReactFlowProvider>
  );
};

export default FamilyTree;
