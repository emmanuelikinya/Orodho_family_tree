import { X, Heart, Calendar, Users, User } from 'lucide-react';
import { formatDate, getSpouseDetails, getParentDetails, getChildrenDetails } from '../utils/familyTreeUtils';

const PersonDetail = ({ person, familyMembers, onClose }) => {
  if (!person) return null;

  const spouses = getSpouseDetails(familyMembers, person);
  const parents = getParentDetails(familyMembers, person);
  const children = getChildrenDetails(familyMembers, person);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
          }}
        >
          <X size={24} />
        </button>

        {/* Header with photo */}
        <div
          style={{
            background: person.gender === 'male' ? '#4A90E2' : '#E91E63',
            padding: '30px',
            borderRadius: '16px 16px 0 0',
            textAlign: 'center',
            color: 'white',
          }}
        >
          <div
            style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 15px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid white',
            }}
          >
            <img
              src={person.photo || '/photos/placeholder-male.jpg'}
              alt={person.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
          <h2 style={{ margin: '10px 0', fontSize: '24px' }}>{person.name}</h2>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            {person.isDeceased ? '† Deceased' : 'Living'}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '25px' }}>
          {/* Description */}
          {person.description && (
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#333' }}>
                About
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6', fontSize: '14px' }}>
                {person.description}
              </p>
            </div>
          )}

          {/* Birth and Death Info */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
              marginBottom: '25px',
            }}
          >
            <div
              style={{
                padding: '15px',
                background: '#f5f5f5',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '5px',
                }}
              >
                <Calendar size={16} color="#666" />
                <span style={{ fontSize: '12px', color: '#666' }}>Born</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>
                {formatDate(person.birthDate)}
              </div>
            </div>

            {person.deathDate && (
              <div
                style={{
                  padding: '15px',
                  background: '#f5f5f5',
                  borderRadius: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '5px',
                  }}
                >
                  <Calendar size={16} color="#666" />
                  <span style={{ fontSize: '12px', color: '#666' }}>Died</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                  {formatDate(person.deathDate)}
                </div>
              </div>
            )}
          </div>

          {/* Parents */}
          {parents.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h3
                style={{
                  fontSize: '16px',
                  marginBottom: '10px',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Users size={18} /> Parents
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {parents.map((parent) => (
                  <div
                    key={parent.id}
                    style={{
                      padding: '10px',
                      background: '#f9f9f9',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  >
                    {parent.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spouses/Marriages */}
          {spouses.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h3
                style={{
                  fontSize: '16px',
                  marginBottom: '10px',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Heart size={18} /> {spouses.length > 1 ? 'Marriages' : 'Marriage'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {spouses.map((spouse, index) => (
                  <div
                    key={spouse.id}
                    style={{
                      padding: '12px',
                      background: '#fff0f5',
                      borderRadius: '8px',
                      border: '1px solid #ffcce0',
                    }}
                  >
                    <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '5px' }}>
                      {spouse.name}
                      {spouses.length > 1 && (
                        <span style={{ color: '#999', fontSize: '12px', marginLeft: '8px' }}>
                          (Marriage {spouse.marriageOrder || index + 1})
                        </span>
                      )}
                    </div>
                    {spouse.marriageDate && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Married: {formatDate(spouse.marriageDate)}
                      </div>
                    )}
                    {spouse.children && spouse.children.length > 0 && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                        Children together: {spouse.children.length}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Children */}
          {children.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h3
                style={{
                  fontSize: '16px',
                  marginBottom: '10px',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <User size={18} /> Children ({children.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {children.map((child) => (
                  <div
                    key={child.id}
                    style={{
                      padding: '10px',
                      background: '#f0f8ff',
                      borderRadius: '8px',
                      fontSize: '14px',
                      border: '1px solid #d0e8ff',
                    }}
                  >
                    {child.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonDetail;
