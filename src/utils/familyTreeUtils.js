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
  const spouseSpacingXEarly = 100; // Horizontal space between husband and wife (early generations)
  const spouseSpacingXLater = 30; // Horizontal space between husband and wife (generation B+)
  const spouseSpacingY = 120; // Vertical space between multiple wives (stacked with overlap)
  const siblingSpacing = 120; // Space between children within same family
  const siblingSpacingMinimal = 50; // Minimal space between siblings with no children
  const familyUnitSpacing = 1200; // Space between sibling family units (B generation) with children
  const familyUnitSpacingMinimal = 300; // Space between B generation siblings with no children
  const generationSpacing = 280; // Vertical space between generations
  const generationBThreshold = 7; // Generation level where B starts (Canon Ezekiel's children)

  // Track positions
  const nodePositions = new Map();

  // Helper function to check if a person has any children/descendants
  const hasDescendants = (personId, memberMap) => {
    const person = memberMap.get(personId);
    if (!person || !person.spouses) return false;

    let childCount = 0;
    person.spouses.forEach(spouse => {
      if (spouse.children && spouse.children.length > 0) {
        childCount += spouse.children.length;
      }
    });
    return childCount > 0;
  };

  // Helper function to calculate the width needed for a person's entire subtree
  const calculateSubtreeWidth = (personId, generation, memberMap, visited) => {
    if (visited.has(personId)) return 0;

    const person = memberMap.get(personId);
    if (!person) return nodeWidth;

    let totalWidth = nodeWidth; // Start with the person's node width

    // Add spouse width
    const spouseSpacing = generation >= generationBThreshold ? spouseSpacingXLater : spouseSpacingXEarly;
    if (person.spouses && person.spouses.length > 0) {
      totalWidth += spouseSpacing + nodeWidth;
    }

    // Collect all children
    const allChildren = [];
    if (person.spouses) {
      person.spouses.forEach(spouse => {
        if (spouse.children) {
          spouse.children.forEach(childId => {
            if (!allChildren.includes(childId)) {
              allChildren.push(childId);
            }
          });
        }
      });
    }

    // If has children, calculate their total width with dynamic spacing
    if (allChildren.length > 0) {
      let childrenTotalWidth = 0;

      allChildren.forEach((childId, index) => {
        if (!visited.has(childId)) {
          const childWidth = calculateSubtreeWidth(childId, generation + 1, memberMap, visited);
          childrenTotalWidth += childWidth;

          // Add dynamic spacing based on whether children have descendants
          if (index < allChildren.length - 1) {
            const nextChildId = allChildren[index + 1];
            const thisHasDescendants = hasDescendants(childId, memberMap);
            const nextHasDescendants = hasDescendants(nextChildId, memberMap);

            let spacing;
            if ((generation + 1) === generationBThreshold) {
              // B generation siblings
              spacing = (thisHasDescendants || nextHasDescendants) ? familyUnitSpacing : familyUnitSpacingMinimal;
            } else {
              // Other generation siblings
              spacing = (thisHasDescendants || nextHasDescendants) ? siblingSpacing : siblingSpacingMinimal;
            }
            childrenTotalWidth += spacing;
          }
        }
      });

      // Use the wider of: person+spouse width or children total width
      totalWidth = Math.max(totalWidth, childrenTotalWidth);
    }

    return totalWidth;
  };

  // Layout family unit (couple + their children) recursively
  const layoutFamilyUnit = (personId, startX, startY, generation) => {
    if (positioned.has(personId)) {
      const existing = nodePositions.get(personId);
      return { ...existing, rightmostX: existing.x + nodeWidth };
    }

    const person = memberMap.get(personId);
    if (!person) return { x: startX, y: startY, width: nodeWidth, rightmostX: startX + nodeWidth };

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
      // Use smaller spacing for generation B and onwards
      const spouseSpacingX = generation >= generationBThreshold ? spouseSpacingXLater : spouseSpacingXEarly;
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
        // Calculate the center point between the person and the rightmost spouse
        const familyCenter = (currentX + rightmostX) / 2;

        // Children should be placed below the lowest spouse
        const childrenY = bottommostY + generationSpacing;

        // First pass: calculate actual widths and appropriate spacing for each child
        let childSubtreeWidths = [];
        let childSpacings = [];
        let tempPositioned = new Set(positioned);

        allChildren.forEach((childId, index) => {
          if (!positioned.has(childId)) {
            // Calculate width recursively by measuring subtree
            const childWidth = calculateSubtreeWidth(childId, generation + 1, memberMap, tempPositioned);
            childSubtreeWidths.push(childWidth);
            tempPositioned.add(childId);

            // Determine spacing based on whether this child and next child have descendants
            if (index < allChildren.length - 1) {
              const nextChildId = allChildren[index + 1];
              const thisHasDescendants = hasDescendants(childId, memberMap);
              const nextHasDescendants = hasDescendants(nextChildId, memberMap);

              // Dynamic spacing based on generation and whether children have descendants
              let spacing;
              if ((generation + 1) === generationBThreshold) {
                // B generation siblings
                if (thisHasDescendants || nextHasDescendants) {
                  spacing = familyUnitSpacing; // Full spacing if either has children
                } else {
                  spacing = familyUnitSpacingMinimal; // Minimal spacing if both have no children
                }
              } else {
                // Other generation siblings
                if (thisHasDescendants || nextHasDescendants) {
                  spacing = siblingSpacing; // Normal spacing if either has children
                } else {
                  spacing = siblingSpacingMinimal; // Minimal spacing if both have no children
                }
              }
              childSpacings.push(spacing);
            }
          } else {
            childSubtreeWidths.push(0);
          }
        });

        // Calculate total width needed with dynamic spacing
        let totalChildrenWidth = childSubtreeWidths.reduce((sum, width) => sum + width, 0);
        totalChildrenWidth += childSpacings.reduce((sum, spacing) => sum + spacing, 0);

        // For early generations (ancestors before Canon Ezekiel), keep them vertically aligned
        // Only center children under parents from generation B onwards
        let childStartX;
        if (generation < generationBThreshold - 1) {
          // Early generations: position children starting from parent's X position (keep ancestors vertically aligned)
          childStartX = currentX;
        } else {
          // Later generations: center children under parents
          childStartX = familyCenter - (totalChildrenWidth / 2);
        }

        // Position each child and track rightmost position
        let childCurrentX = childStartX;
        allChildren.forEach((childId, childIndex) => {
          if (!positioned.has(childId)) {
            // Recursively layout this child's family
            const childResult = layoutFamilyUnit(childId, childCurrentX, startY, generation + 1);

            // Update rightmost position using actual layout result
            if (childResult && childResult.rightmostX) {
              rightmostX = Math.max(rightmostX, childResult.rightmostX);
              // Use the larger of calculated width or actual width, plus dynamic spacing
              const actualWidth = childResult.rightmostX - childCurrentX;
              const spacing = childSpacings[childIndex] || 0;
              childCurrentX = childResult.rightmostX + spacing;
            } else {
              const spacing = childSpacings[childIndex] || 0;
              childCurrentX += childSubtreeWidths[childIndex] + spacing;
            }

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

    return { x: currentX, y: currentY, width: rightmostX - currentX, rightmostX: rightmostX };
  };

  // Start with root members and layout each family tree
  // Use a fixed starting position for the ancestral line to keep them vertically aligned
  let currentX = 100; // Fixed starting X position for ancestors
  roots.forEach((root, rootIndex) => {
    if (!positioned.has(root.id)) {
      const result = layoutFamilyUnit(root.id, currentX, 0, 0);
      // For multiple root trees, add spacing
      if (rootIndex < roots.length - 1) {
        currentX = (result.rightmostX || (result.x + result.width)) + 300;
      }
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
