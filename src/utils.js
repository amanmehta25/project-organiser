/**
 * Reorder items within a list
 */
const reorder = (list, startIndex, endIndex) => {
    const items = Array.from(list);
    const [removed] = items.splice(startIndex, 1);

    items.splice(endIndex, 0, removed);

    return items;
};

/**
 * Moves an item from one list to another list
 */
const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const items = {};
    items[droppableSource.droppableId] = sourceClone;
    items[droppableDestination.droppableId] = destClone;

    return items;
};

export {
    reorder,
    move
};
