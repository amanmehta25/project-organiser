import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { reorder, move } from './utils';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);

        const stateFromLocalStorage = JSON.parse(localStorage.getItem('list'));

        this.state = {
            list: {
                newListAttributes: {
                    id: 1,
                    title: '',
                    placeholder: '+ Add a list',
                    isActive: false
                },
                data: {},
                uniqueId: 1
            },
            ...stateFromLocalStorage
        };
    }

    updateLocalStorage = () => {
        localStorage.setItem('list', JSON.stringify(this.state));
    }

    getListItems = (listId) => {
        const { list } = this.state;

        return list.data[listId].items;
    }

    onDragEnd = result => {
        const { source, destination } = result;

        // dnd outside the list
        if (!destination) {
            return;
        }

        const { list } = this.state;
        let modifiedList;

        if (source.droppableId === destination.droppableId) { // dnd within the same list
            const items = reorder(
                this.getListItems(source.droppableId),
                source.index,
                destination.index
            );

            modifiedList = {
                ...list,
                data: {
                    ...list.data,
                    [source.droppableId]: {
                        ...list.data[source.droppableId],
                        items
                    }
                }
            };
        } else { // dnd across the lists
            const items = move(
                this.getListItems(source.droppableId),
                this.getListItems(destination.droppableId),
                source,
                destination
            );

            modifiedList = {
                ...list,
                data: {
                    ...list.data,
                    [source.droppableId]: {
                        ...list.data[source.droppableId],
                        items: items[source.droppableId]
                    },
                    [destination.droppableId]: {
                        ...list.data[destination.droppableId],
                        items: items[destination.droppableId]
                    }
                }
            };
        }

        this.setState({ list: modifiedList }, () => { this.updateLocalStorage(); });
    };

    handleNewListClick = (status) => (e) => {
        this.setState(prevState => {
            return {
                list: {
                    ...prevState.list,
                    newListAttributes: {
                        ...prevState.list.newListAttributes,
                        title: '',
                        isActive: status
                    }
                }
            }
        });
    }

    handleNewListInputChange = (e) => {
        e.persist();

        this.setState(prevState => {
            return {
                list: {
                    ...prevState.list,
                    newListAttributes: {
                        ...prevState.list.newListAttributes,
                        title: e.target.value
                    }
                }
            }
        });
    }

    handleNewListSubmit = (e) => {
        e.preventDefault();

        this.setState(prevState => {
            const { list } = prevState;
            const { newListAttributes } = list;
            const { id: currentId, title: currentTitle } = newListAttributes;

            if (currentTitle === '') {
                return prevState;
            }

            let modifiedList = { ...list };

            modifiedList = {
                ...modifiedList,
                data: {
                ...modifiedList.data,
                [currentId]: {
                    id: currentId,
                    title: currentTitle,
                    items: [],
                    newItemAttributes: {
                        description: '',
                        placeholder: '+ Add a card',
                        isActive: false
                    }
                }
                },
                newListAttributes: {
                    id: currentId + 1,
                    title: '',
                    placeholder: '+ Add another list',
                    isActive: false
                }
            };

            return {
                list: modifiedList
            };
        }, () => {
            this.updateLocalStorage();
        });
    }

    handleNewCardClick = (currentListId, status) => (e) => {
        e.persist();

        this.setState(prevState => {
            const { list } = prevState;
            let modifiedList = { ...list };

            modifiedList = {
                ...modifiedList,
                data: {
                    ...modifiedList.data,
                    [currentListId]: {
                        ...modifiedList.data[currentListId],
                        newItemAttributes: {
                            ...modifiedList.data[currentListId].newItemAttributes,
                            description: '',
                            isActive: status
                        }
                    }
                }
            };

            return {
                list: modifiedList
            };
        });
    }

    handleNewCardInputChange = (currentListId) => (e) => {
        e.persist();

        this.setState(prevState => {
            const { list } = prevState;
            let modifiedList = { ...list };

            modifiedList = {
                ...modifiedList,
                data: {
                    ...modifiedList.data,
                    [currentListId]: {
                        ...modifiedList.data[currentListId],
                        newItemAttributes: {
                            ...modifiedList.data[currentListId].newItemAttributes,
                            description: e.target.value
                        }
                    }
                }
            };

            return {
                list: modifiedList
            };
        });
    }

    handleNewCardSubmit = (currentListId) => (e) => {
        e.preventDefault();

        this.setState(prevState => {
            const { list } = prevState;
            let modifiedList = { ...list };
            const { newItemAttributes } = modifiedList.data[currentListId];
            const { description: currentDescription } = newItemAttributes;

            if (currentDescription === '') {
                modifiedList = {
                    ...modifiedList,
                    data: {
                        ...modifiedList.data,
                        [currentListId]: {
                            ...modifiedList.data[currentListId],
                            newItemAttributes: {
                                ...modifiedList.data[currentListId].newItemAttributes,
                                isActive: false
                            }
                        }
                    }
                };

                return {
                    list: modifiedList
                };
            }

            const modifiedItems = [...modifiedList.data[currentListId].items];
            modifiedItems.push({
                id: list.uniqueId,
                description: currentDescription
            });

            modifiedList = {
                ...modifiedList,
                data: {
                    ...modifiedList.data,
                    [currentListId]: {
                        ...modifiedList.data[currentListId],
                        items: modifiedItems,
                        newItemAttributes: {
                            description: '',
                            placeholder: '+ Add another card',
                            isActive: false
                        }
                    }
                },
                uniqueId: list.uniqueId + 1
            };

            return {
                list: modifiedList
            };
        }, () => {
            this.updateLocalStorage();
        });
    }

    handleExistingCardAction = (currentListId, currentItemId, isSubmit) => (e) => {
        if (isSubmit) {
            e.preventDefault();
        }

        this.setState(prevState => {
            const { list } = prevState;
            let modifiedList = { ...list };

            const modifiedItems = modifiedList.data[currentListId].items
                .filter(item => !!item.description)
                .map((item) => {
                    if (item.id === currentItemId) {
                        item = {
                            ...item,
                            isActive: !isSubmit
                        }
                    }

                    return item;
                });

            modifiedList = {
                ...modifiedList,
                data: {
                    ...modifiedList.data,
                    [currentListId]: {
                        ...modifiedList.data[currentListId],
                        items: modifiedItems
                    }
                }
            };

            return {
                list: modifiedList
            };
        }, () => {
            if (isSubmit) {
                this.updateLocalStorage();
            }
        });
    }

    handleExisitingCardInputChange = (currentListId, currentItemId) => (e) => {
        e.persist();

        this.setState(prevState => {
            const { list } = prevState;
            let modifiedList = { ...list };

            const modifiedItems = modifiedList.data[currentListId].items.map((item, index) => {
                if (item.id === currentItemId) {
                    item = {
                        ...item,
                        description: e.target.value
                    }
                }

                return item;
            });

            modifiedList = {
                ...modifiedList,
                data: {
                    ...modifiedList.data,
                    [currentListId]: {
                        ...modifiedList.data[currentListId],
                        items: modifiedItems
                    }
                }
            };

            return {
                list: modifiedList
            };
        });
    }

    render() {
        const { list } = this.state;
        const { data, newListAttributes } = list;
        const { isActive: isListActive, title: listTitle, placeholder: listPlaceholder } = newListAttributes;
        const listIds = Object.keys(data);

        return (
            <div className="main-container">
                <div className="heading">Project Organiser</div>
                <DragDropContext onDragEnd={this.onDragEnd}>
                    <div className="list-container">
                        {listIds.map((listId, index) => {
                            const { title, items, newItemAttributes } = list.data[listId];
                            const { placeholder: itemPlaceholder, description: itemDescription, isActive } = newItemAttributes;

                            return (
                                <div className="list-wrapper" key={listId}>
                                    <div className="list-title">{title}</div>

                                    <Droppable droppableId={listId}>
                                        {(provided) => (
                                            <div
                                                key={listId}
                                                ref={provided.innerRef}
                                                className="list-items"
                                            >
                                                {items.map((item, index) => {
                                                    if (item.isActive) {
                                                        return (
                                                            <form key={item.id} onSubmit={this.handleExistingCardAction(listId, item.id, true)}>
                                                                <textarea
                                                                    className="common-input textarea" autoFocus
                                                                    value={item.description}
                                                                    onChange={this.handleExisitingCardInputChange(listId, item.id)}
                                                                    onBlur={this.handleExistingCardAction(listId, item.id, true)}
                                                                />
                                                                <div className="save-button-wrapper">
                                                                    <button className="button button--primary save-button" type="submit">Save</button>
                                                                </div>
                                                            </form>
                                                        );
                                                    }

                                                    return (
                                                        <Draggable
                                                            key={item.id}
                                                            draggableId={item.id.toString()}
                                                            index={index}
                                                        >
                                                            {(provided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className="list-item"
                                                                    onClick={this.handleExistingCardAction(listId, item.id)}
                                                                >
                                                                    {item.description}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>

                                    {!isActive ? (
                                        <div className="new-item-wrapper" onClick={this.handleNewCardClick(listId, true)}>
                                            {itemPlaceholder}
                                        </div>
                                    ) : (
                                        <form onSubmit={this.handleNewCardSubmit(listId)}>
                                            <textarea
                                                className="common-input textarea" autoFocus
                                                value={itemDescription} placeholder="Enter a detailed description for the card..."
                                                onChange={this.handleNewCardInputChange(listId)}
                                            />
                                            <div className="button-wrapper">
                                                <button className="button button--secondary" type="button" onClick={this.handleNewCardClick(listId, false)}>Cancel</button>
                                                <button className="button button--primary" type="submit">Add Card</button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )
                        })}

                        {!isListActive ? (
                            <div className="new-list-wrapper" onClick={this.handleNewListClick(true)}>
                                {listPlaceholder}
                            </div>
                        ) : (
                            <div className="list-wrapper">
                                <form onSubmit={this.handleNewListSubmit}>
                                    <input
                                        className="common-input textinput" autoFocus
                                        type="text" value={listTitle}
                                        placeholder="Enter list title..."
                                        onChange={this.handleNewListInputChange}
                                        maxLength="80"
                                    />
                                    <div className="button-wrapper">
                                        <button className="button button--secondary" type="button" onClick={this.handleNewListClick(false)}>Cancel</button>
                                        <button className="button button--primary" type="submit">Add List</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </DragDropContext>
            </div>
        );
    }
}

export default App;
