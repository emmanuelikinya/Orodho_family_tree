import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Heart, Plus, Edit } from 'lucide-react';

const PersonNode = ({ data, isConnectable, selected }) => {
  const { name, photo, birthDate, deathDate, isDeceased, gender, spouses, memberId } = data;

  const calculateAge = () => {
    if (!birthDate) return '';
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    const age = end.getFullYear() - birth.getFullYear();
    return age;
  };

  const age = calculateAge();
  const hasMultipleSpouses = spouses && spouses.length > 1;

  return (
    <div
      className={`person-node ${isDeceased ? 'deceased' : 'living'} ${gender}`}
      style={{
        padding: '10px',
        borderRadius: '12px',
        border: isDeceased ? '3px solid #666' : '3px solid #4CAF50',
        background: 'white',
        minWidth: '180px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        position: 'relative',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ background: '#555' }}
      />

      {/* Status indicators */}
      <div style={{
        position: 'absolute',
        top: '5px',
        right: '5px',
        display: 'flex',
        gap: '5px',
      }}>
        {hasMultipleSpouses && (
          <div title="Multiple marriages" style={{
            background: '#ff69b4',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Heart size={14} color="white" />
          </div>
        )}
      </div>

      {/* Photo */}
      <div style={{
        width: '80px',
        height: '80px',
        margin: '0 auto 10px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: `3px solid ${gender === 'male' ? '#4A90E2' : '#E91E63'}`,
      }}>
        <img
          src={photo || '/photos/placeholder-male.jpg'}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Name */}
      <div style={{
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '14px',
        marginBottom: '5px',
        color: '#333',
      }}>
        {name}
      </div>

      {/* Member ID */}
      {memberId && (
        <div style={{
          textAlign: 'center',
          fontSize: '10px',
          fontWeight: '600',
          color: '#fff',
          background: '#2196F3',
          padding: '2px 8px',
          borderRadius: '10px',
          marginBottom: '5px',
          display: 'inline-block',
          width: 'fit-content',
          margin: '0 auto 5px',
        }}>
          {memberId}
        </div>
      )}

      {/* Age/Status */}
      <div style={{
        textAlign: 'center',
        fontSize: '12px',
        color: '#666',
      }}>
        {isDeceased ? (
          <span style={{ color: '#d32f2f' }}>† {age} years</span>
        ) : (
          <span style={{ color: '#4CAF50' }}>{age} years old</span>
        )}
      </div>

      {/* Birth/Death dates */}
      {birthDate && (
        <div style={{
          textAlign: 'center',
          fontSize: '10px',
          color: '#999',
          marginTop: '5px',
        }}>
          {new Date(birthDate).getFullYear()}
          {deathDate && ` - ${new Date(deathDate).getFullYear()}`}
        </div>
      )}

      {/* Action buttons - shown when selected */}
      {selected && (
        <div style={{
          position: 'absolute',
          bottom: '-15px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '5px',
          zIndex: 10,
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (data.onAddChild) data.onAddChild(data);
            }}
            title="Add child"
            style={{
              background: '#4CAF50',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            <Plus size={16} color="white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (data.onAddSpouse) data.onAddSpouse(data);
            }}
            title="Add spouse"
            style={{
              background: '#ff69b4',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            <Heart size={16} color="white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (data.onEdit) data.onEdit(data);
            }}
            title="Edit details"
            style={{
              background: '#2196F3',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            <Edit size={16} color="white" />
          </button>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ background: '#555' }}
      />
    </div>
  );
};

export default memo(PersonNode);
