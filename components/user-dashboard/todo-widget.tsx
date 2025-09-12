'use client';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface TodoItem {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    due_date: string | null;
    created_at: string;
    updated_at: string;
}

const TodoWidget = () => {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTodo, setNewTodo] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        dueDate: ''
    });

    // Fetch TODO items
    const fetchTodos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/todo');
            if (!response.ok) {
                throw new Error('Failed to fetch TODO items');
            }
            const data = await response.json();
            setTodos(data);
        } catch (err: any) {
            setError(err.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message,
                padding: '2em',
                customClass: {
                    container: 'sweet-alerts'
                },
            });
        } finally {
            setLoading(false);
        }
    };

    // Add a new TODO item
    const addTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/todo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newTodo.title,
                    description: newTodo.description,
                    priority: newTodo.priority,
                    dueDate: newTodo.dueDate || null
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add TODO item');
            }

            const data = await response.json();
            setTodos([data, ...todos]);
            setNewTodo({
                title: '',
                description: '',
                priority: 'medium',
                dueDate: ''
            });
            setShowAddForm(false);
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'TODO item added successfully',
                padding: '2em',
                customClass: {
                    container: 'sweet-alerts'
                },
            });
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message,
                padding: '2em',
                customClass: {
                    container: 'sweet-alerts'
                },
            });
        }
    };

    // Update a TODO item status
    const updateTodoStatus = async (id: number, status: 'pending' | 'in-progress' | 'completed') => {
        try {
            const response = await fetch('/api/todo', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    status
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update TODO item');
            }

            const data = await response.json();
            setTodos(todos.map(todo => todo.id === id ? data : todo));
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message,
                padding: '2em',
                customClass: {
                    container: 'sweet-alerts'
                },
            });
        }
    };

    // Delete a TODO item
    const deleteTodo = async (id: number) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            padding: '2em',
            customClass: {
                container: 'sweet-alerts'
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/api/todo?id=${id}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to delete TODO item');
                    }

                    setTodos(todos.filter(todo => todo.id !== id));
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Your TODO item has been deleted.',
                        padding: '2em',
                        customClass: {
                            container: 'sweet-alerts'
                        },
                    });
                } catch (err: any) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: err.message,
                        padding: '2em',
                        customClass: {
                            container: 'sweet-alerts'
                        },
                    });
                }
            }
        });
    };

    // Format date for display
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Get priority class for styling
    const getPriorityClass = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-danger/20 text-danger';
            case 'medium': return 'bg-warning/20 text-warning';
            case 'low': return 'bg-success/20 text-success';
            default: return 'bg-info/20 text-info';
        }
    };

    // Get status class for styling
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-success/20 text-success';
            case 'in-progress': return 'bg-warning/20 text-warning';
            case 'pending': return 'bg-info/20 text-info';
            default: return 'bg-secondary/20 text-secondary';
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    if (loading) {
        return (
            <div className="panel">
                <h5 className="mb-5 text-lg font-semibold">Your TODO List</h5>
                <p>Loading TODO items...</p>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="flex justify-between items-center mb-5">
                <h5 className="text-lg font-semibold">Your TODO List</h5>
                <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Cancel' : 'Add TODO'}
                </button>
            </div>

            {showAddForm && (
                <div className="mb-6 p-4 border rounded-lg bg-white dark:bg-black">
                    <h6 className="text-md font-semibold mb-3">Add New TODO</h6>
                    <form onSubmit={addTodo}>
                        <div className="mb-3">
                            <label htmlFor="title" className="block text-sm font-medium mb-1">Title *</label>
                            <input
                                type="text"
                                id="title"
                                className="form-input"
                                value={newTodo.title}
                                onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                id="description"
                                className="form-textarea"
                                rows={3}
                                value={newTodo.description}
                                onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium mb-1">Priority</label>
                                <select
                                    id="priority"
                                    className="form-select"
                                    value={newTodo.priority}
                                    onChange={(e) => setNewTodo({...newTodo, priority: e.target.value as any})}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium mb-1">Due Date</label>
                                <input
                                    type="date"
                                    id="dueDate"
                                    className="form-input"
                                    value={newTodo.dueDate}
                                    onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">Add TODO</button>
                    </form>
                </div>
            )}

            {error && (
                <div className="p-3.5 rounded-md bg-danger-light text-danger mb-4">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {todos.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No TODO items found. Add your first TODO item!</p>
                    </div>
                ) : (
                    todos.map((todo) => (
                        <div key={todo.id} className="border rounded-lg p-4 bg-white dark:bg-black">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h6 className="font-semibold text-lg">{todo.title}</h6>
                                    {todo.description && (
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">{todo.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityClass(todo.priority)}`}>
                                            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
                                        </span>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(todo.status)}`}>
                                            {todo.status.replace('-', ' ').charAt(0).toUpperCase() + todo.status.replace('-', ' ').slice(1)}
                                        </span>
                                        {todo.due_date && (
                                            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-info/20 text-info">
                                                Due: {formatDate(todo.due_date)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        className="form-select text-xs"
                                        value={todo.status}
                                        onChange={(e) => updateTodoStatus(todo.id, e.target.value as any)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteTodo(todo.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TodoWidget;