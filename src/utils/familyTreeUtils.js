/**
 * Utility functions for transforming family data into React Flow format
 */

// Calculate generation levels for proper tree layout
export const calculateGenerations = (familyMembers) => {
  const generations = new Map();
  const visited = new Set();
  const memberMap = new Map(familyMembers.map(m => [m.id, m]));

  // Find root members (those without parents)
  const roots = familyMembers.filter(member =>
    !member.parents || member.parents.length === 0
  );

  // BFS to assign generation levels
  const queue = roots.map(root => ({ id: root.id, level: 0 }));

  while (queue.length > 0) {
    const { id, level } = queue.shift();

    if (visited.has(id)) continue;
    visited.add(id);
    generations.set(id, level);

    const member = memberMap.get(id);

    // Assign spouses to the same generation level
    if (member && member.spouses) {
      member.spouses.forEach(spouse => {
        if (!visited.has(spouse.spouseId)) {
          queue.push({ id: spouse.spouseId, level: level });
        }

        // Add children to next generation
        if (spouse.children) {
          spouse.children.forEach(childId => {
            if (!visited.has(childId)) {
              queue.push({ id: childId, level: level + 1 });
            }
          });
        }
      });
    }
  }

  return generations;
};

// Transform family data to React Flow nodes and edges with strict matrix/grid layout
export const transformToFlowData = (familyMembers) => {
  const nodes = [];
  const edges = [];
  const memberMap = new Map(familyMembers.map(m => [m.id, m]));

  // Calculate generation levels for all members
  const generations = calculateGenerations(familyMembers);

  // Group members by generation
  const generationGroups = new Map();
  familyMembers.forEach(member => {
    const level = generations.get(member.id);
    if (level !== undefined) {
      if (!generationGroups.has(level)) {
        generationGroups.set(level, []);
      }
      generationGroups.get(level).push(member);
    }
  });

  const xSpacing = 300; // Horizontal spacing between people
  const ySpacing = 300; // Vertical spacing between generations

  // Position ALL members generation by generation - simple grid layout
  const sortedGenerations = Array.from(generationGroups.keys()).sort((a, b) => a - b);

  sortedGenerations.forEach(genLevel => {
    const members = generationGroups.get(genLevel);
    const y = genLevel * ySpacing;

    // Position all members in this generation horizontally
    members.forEach((member, index) => {
      const x = index * xSpacing;
      nodes.push({
        id: member.id,
        type: 'personNode',
        position: { x, y },
        data: { ...member },
      });
    });
  });

  // Create all edges after positioning is complete
  familyMembers.forEach(member => {
    if (member.spouses && member.spouses.length > 0) {
      member.spouses.forEach((spouse, spouseIndex) => {
        // Create marriage edge
        if (memberMap.has(spouse.spouseId)) {
          edges.push({
            id: `marriage-${member.id}-${spouse.spouseId}`,
            source: member.id,
            target: spouse.spouseId,
            type: 'straight',
            style: { stroke: '#ff69b4', strokeWidth: 2 },
            animated: false,
            label: spouse.marriageDate ? `Married ${new Date(spouse.marriageDate).getFullYear()}` : 'Married',
          });
        }

        // Create parent-child edges
        if (spouse.children && spouse.children.length > 0) {
          spouse.children.forEach((childId) => {
            if (memberMap.has(childId)) {
              edges.push({
                id: `parent-child-${member.id}-${childId}`,
                source: member.id,
                target: childId,
                type: 'smoothstep',
                style: { stroke: '#000', strokeWidth: 2 },
                animated: false,
              });
            }
          });
        }
      });
    }
  });

  return { nodes, edges };
};

// Get person details by ID
export const getPersonById = (familyMembers, id) => {
  return familyMembers.find(member => member.id === id);
};

// Get spouse details
export const getSpouseDetails = (familyMembers, member) => {
  if (!member.spouses) return [];

  return member.spouses.map(spouse => {
    const spouseData = getPersonById(familyMembers, spouse.spouseId);
    return {
      ...spouseData,
      marriageDate: spouse.marriageDate,
      marriageOrder: spouse.marriageOrder,
      children: spouse.children,
    };
  });
};

// Get children details
export const getChildrenDetails = (familyMembers, member) => {
  if (!member.spouses) return [];

  const allChildren = [];
  member.spouses.forEach(spouse => {
    if (spouse.children) {
      spouse.children.forEach(childId => {
        const child = getPersonById(familyMembers, childId);
        if (child) {
          allChildren.push({
            ...child,
            motherOrFatherId: spouse.spouseId,
          });
        }
      });
    }
  });

  return allChildren;
};

// Get parent details
export const getParentDetails = (familyMembers, member) => {
  if (!member.parents || member.parents.length === 0) return [];

  return member.parents.map(parentId => getPersonById(familyMembers, parentId)).filter(Boolean);
};

// Calculate age or years since death
export const calculateAge = (birthDate, deathDate = null) => {
  const birth = new Date(birthDate);
  const end = deathDate ? new Date(deathDate) : new Date();
  const age = end.getFullYear() - birth.getFullYear();
  return age;
};

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};
