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

// Transform family data to React Flow nodes and edges with traditional family tree layout
export const transformToFlowData = (familyMembers) => {
  const nodes = [];
  const edges = [];
  const memberMap = new Map(familyMembers.map(m => [m.id, m]));
  const positioned = new Set();

  // Calculate generation levels for all members
  const generations = calculateGenerations(familyMembers);

  // Find root members (those without parents)
  const roots = familyMembers.filter(member =>
    !member.parents || member.parents.length === 0
  );

  const nodeWidth = 250; // Width of each person card
  const nodeHeight = 200; // Height of each person card
  const spouseSpacingX = 100; // Horizontal space between husband and wife
  const spouseSpacingY = 50; // Vertical space between multiple wives (stacked)
  const siblingSpacing = 50; // Space between siblings
  const generationSpacing = 250; // Vertical space between generations

  // Track positions
  const nodePositions = new Map();

  // Layout family unit (couple + their children) recursively
  const layoutFamilyUnit = (personId, startX, startY, generation) => {
    if (positioned.has(personId)) {
      return nodePositions.get(personId);
    }

    const person = memberMap.get(personId);
    if (!person) return { x: startX, y: startY, width: nodeWidth };

    let currentX = startX;
    const currentY = startY + (generation * generationSpacing);

    // Position the person
    nodePositions.set(personId, { x: currentX, y: currentY });
    positioned.add(personId);

    nodes.push({
      id: personId,
      type: 'personNode',
      position: { x: currentX, y: currentY },
      data: { ...person },
    });

    // Track rightmost position and bottom-most position
    let rightmostX = currentX + nodeWidth;
    let bottommostY = currentY;

    // Collect all children from all marriages
    const allChildren = [];

    // Handle spouses - stack them vertically to the right of the person
    if (person.spouses && person.spouses.length > 0) {
      const spouseX = currentX + nodeWidth + spouseSpacingX;

      person.spouses.forEach((spouse, spouseIndex) => {
        if (memberMap.has(spouse.spouseId) && !positioned.has(spouse.spouseId)) {
          // Stack spouses vertically (offset Y for each additional spouse)
          const spouseY = currentY + (spouseIndex * (nodeHeight + spouseSpacingY));

          nodePositions.set(spouse.spouseId, { x: spouseX, y: spouseY });
          positioned.add(spouse.spouseId);

          nodes.push({
            id: spouse.spouseId,
            type: 'personNode',
            position: { x: spouseX, y: spouseY },
            data: { ...memberMap.get(spouse.spouseId) },
          });

          // Create marriage edge
          edges.push({
            id: `marriage-${personId}-${spouse.spouseId}`,
            source: personId,
            target: spouse.spouseId,
            type: 'straight',
            style: { stroke: '#ff69b4', strokeWidth: 2 },
            animated: false,
            label: spouse.marriageDate ? `Married ${new Date(spouse.marriageDate).getFullYear()}` : 'Married',
          });

          // Update rightmost and bottommost positions
          rightmostX = Math.max(rightmostX, spouseX + nodeWidth);
          bottommostY = Math.max(bottommostY, spouseY);

          // Collect children from this marriage
          if (spouse.children && spouse.children.length > 0) {
            spouse.children.forEach((childId) => {
              if (!allChildren.includes(childId)) {
                allChildren.push(childId);
              }
            });
          }
        }
      });

      // Layout all children centered below the person and all spouses
      if (allChildren.length > 0) {
        // Calculate total width needed for all children
        const totalChildrenWidth = (allChildren.length * nodeWidth) +
          ((allChildren.length - 1) * siblingSpacing);

        // Calculate the center point between the person and the rightmost spouse
        const familyCenter = (currentX + rightmostX) / 2;
        let childStartX = familyCenter - (totalChildrenWidth / 2);

        // Children should be placed below the lowest spouse
        const childrenY = bottommostY + generationSpacing;

        // Position each child
        allChildren.forEach((childId, childIndex) => {
          if (!positioned.has(childId)) {
            const childX = childStartX + (childIndex * (nodeWidth + siblingSpacing));

            // Recursively layout this child's family
            layoutFamilyUnit(childId, childX, startY, generation + 1);

            // Create parent-child edge from the main person (father/mother)
            edges.push({
              id: `parent-${personId}-${childId}`,
              source: personId,
              target: childId,
              type: 'smoothstep',
              style: { stroke: '#666', strokeWidth: 2 },
              animated: false,
            });
          }
        });
      }
    }

    return { x: currentX, y: currentY, width: rightmostX - currentX };
  };

  // Start with root members and layout each family tree
  let currentX = 0;
  roots.forEach((root, rootIndex) => {
    if (!positioned.has(root.id)) {
      const result = layoutFamilyUnit(root.id, currentX, 0, 0);
      currentX = result.width + result.x + 300; // Add spacing between separate family trees
    }
  });

  // Position any remaining unpositioned members (orphaned nodes)
  familyMembers.forEach((member, index) => {
    if (!positioned.has(member.id)) {
      const generation = generations.get(member.id) || 0;
      const y = generation * generationSpacing;
      const x = currentX + (index * (nodeWidth + siblingSpacing));

      nodes.push({
        id: member.id,
        type: 'personNode',
        position: { x, y },
        data: { ...member },
      });

      positioned.add(member.id);
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
