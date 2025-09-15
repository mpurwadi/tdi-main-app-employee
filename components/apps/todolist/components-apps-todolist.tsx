'use client';
import Dropdown from '@/components/dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconClipboardText from '@/components/icon/icon-clipboard-text';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconListCheck from '@/components/icon/icon-list-check';
import IconMenu from '@/components/icon/icon-menu';
import IconPencilPaper from '@/components/icon/icon-pencil-paper';
import IconPlus from '@/components/icon/icon-plus';
import IconRestore from '@/components/icon/icon-restore';
import IconSearch from '@/components/icon/icon-search';
import IconSquareRotated from '@/components/icon/icon-square-rotated';
import IconStar from '@/components/icon/icon-star';
import IconThumbUp from '@/components/icon/icon-thumb-up';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconUser from '@/components/icon/icon-user';
import IconX from '@/components/icon/icon-x';
import { IRootState } from '@/store';
import { Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import 'react-quill/dist/quill.snow.css';
import PerfectScrollbar from 'react-perfect-scrollbar';

interface TodoItem {
    id: number;
    user_id: number;
    title: string;
    description: string;
    descriptionText: string;
    tag: string;
    priority: string;
    status: string;
    date: string;
    path: string;
    created_at: string;
    updated_at: string;
}

const ComponentsAppsTodoList = () => {
    const defaultParams = {
        id: null,
        title: '',
        description: '',
        descriptionText: '',
        path: '',
        tag: '',
        priority: 'low',
    };

    const [selectedTab, setSelectedTab] = useState('');
    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
    const [addTaskModal, setAddTaskModal] = useState(false);
    const [viewTaskModal, setViewTaskModal] = useState(false);
    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));

    const [allTasks, setAllTasks] = useState<TodoItem[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<TodoItem[]>([]);
    const [pagedTasks, setPagedTasks] = useState<TodoItem[]>([]);
    const [searchTask, setSearchTask] = useState<any>('');
    const [selectedTask, setSelectedTask] = useState<any>(defaultParams);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [pager] = useState<any>({
        currentPage: 1,
        totalPages: 0,
        pageSize: 10,
        startIndex: 0,
        endIndex: 0,
    });

    // Fetch all todo list items
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/todo-list', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch todo list items');
            }
            
            const data: TodoItem[] = await response.json();
            setAllTasks(data);
        } catch (err: any) {
            setError(err.message);
            showMessage(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        searchTasks();
    }, [selectedTab, searchTask, allTasks]);

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const searchTasks = (isResetPage = true) => {
        if (isResetPage) {
            pager.currentPage = 1;
        }
        let res: TodoItem[] = [];
        if (selectedTab === 'complete' || selectedTab === 'important' || selectedTab === 'trash') {
            res = allTasks.filter((d) => d.status === selectedTab);
        } else {
            res = allTasks.filter((d) => d.status !== 'trash');
        }

        if (selectedTab === 'team' || selectedTab === 'update') {
            res = res.filter((d) => d.tag === selectedTab);
        } else if (selectedTab === 'high' || selectedTab === 'medium' || selectedTab === 'low') {
            res = res.filter((d) => d.priority === selectedTab);
        }
        setFilteredTasks([...res.filter((d: any) => d.title?.toLowerCase().includes(searchTask))]);
        getPager(res.filter((d: any) => d.title?.toLowerCase().includes(searchTask)));
    };

    const getPager = (res: any) => {
        setTimeout(() => {
            if (res.length) {
                pager.totalPages = pager.pageSize < 1 ? 1 : Math.ceil(res.length / pager.pageSize);
                if (pager.currentPage > pager.totalPages) {
                    pager.currentPage = 1;
                }
                pager.startIndex = (pager.currentPage - 1) * pager.pageSize;
                pager.endIndex = Math.min(pager.startIndex + pager.pageSize - 1, res.length - 1);
                setPagedTasks(res.slice(pager.startIndex, pager.endIndex + 1));
            } else {
                setPagedTasks([]);
                pager.startIndex = -1;
                pager.endIndex = -1;
            }
        });
    };

    const setPriority = (task: TodoItem, name: string = '') => {
        let item = filteredTasks.find((d: any) => d.id === task.id);
        if (item) {
            item.priority = name;
            updateTask(item);
        }
        searchTasks(false);
    };

    const setTag = (task: TodoItem, name: string = '') => {
        let item = filteredTasks.find((d: any) => d.id === task.id);
        if (item) {
            item.tag = name;
            updateTask(item);
        }
        searchTasks(false);
    };

    const tabChanged = () => {
        setIsShowTaskMenu(false);
    };

    const taskComplete = (task: TodoItem | null = null) => {
        if (task) {
            let item = filteredTasks.find((d: any) => d.id === task.id);
            if (item) {
                item.status = item.status === 'complete' ? '' : 'complete';
                updateTask(item);
            }
            searchTasks(false);
        }
    };

    const setImportant = (task: TodoItem | null = null) => {
        if (task) {
            let item = filteredTasks.find((d: any) => d.id === task.id);
            if (item) {
                item.status = item.status === 'important' ? '' : 'important';
                updateTask(item);
            }
            searchTasks(false);
        }
    };

    const viewTask = (item: TodoItem | null = null) => {
        if (item) {
            setSelectedTask(item);
            setTimeout(() => {
                setViewTaskModal(true);
            });
        }
    };

    const addEditTask = (task: TodoItem | null = null) => {
        setIsShowTaskMenu(false);
        let json = JSON.parse(JSON.stringify(defaultParams));
        setParams(json);
        if (task) {
            let json1 = JSON.parse(JSON.stringify(task));
            setParams(json1);
        }
        setAddTaskModal(true);
    };

    const deleteTask = async (task: TodoItem | null, type: string = '') => {
        if (!task) return;
        
        if (type === 'delete') {
            task.status = 'trash';
            await updateTask(task);
        } else if (type === 'deletePermanent') {
            try {
                const response = await fetch(`/api/todo-list?id=${task.id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to delete todo list item');
                }
                
                setAllTasks(allTasks.filter((d: any) => d.id !== task.id));
                showMessage('Task has been deleted successfully.');
            } catch (err: any) {
                showMessage(err.message, 'error');
            }
        } else if (type === 'restore') {
            task.status = '';
            await updateTask(task);
        }
        searchTasks(false);
    };

    const saveTask = async () => {
        if (!params.title) {
            showMessage('Title is required.', 'error');
            return false;
        }
        
        try {
            if (params.id) {
                // Update task
                const response = await fetch('/api/todo-list', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(params),
                });
                
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to update task');
                }
                
                const updatedTask = await response.json();
                setAllTasks(
                    allTasks.map((d: any) => {
                        if (d.id === params.id) {
                            return updatedTask;
                        }
                        return d;
                    }),
                );
                showMessage('Task has been updated successfully.');
            } else {
                // Add task
                const today = new Date();
                const dd = String(today.getDate()).padStart(2, '0');
                const mm = String(today.getMonth());
                const yyyy = today.getFullYear();
                const monthNames: any = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                
                let task = { ...params };
                task.date = monthNames[mm] + ', ' + dd + ' ' + yyyy;
                
                const response = await fetch('/api/todo-list', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(task),
                });
                
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to add task');
                }
                
                const newTask = await response.json();
                setAllTasks([newTask, ...allTasks]);
                showMessage('Task has been added successfully.');
            }
            setAddTaskModal(false);
        } catch (err: any) {
            showMessage(err.message, 'error');
        }
    };

    const updateTask = async (task: TodoItem) => {
        try {
            const response = await fetch('/api/todo-list', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(task),
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update task');
            }
            
            const updatedTask = await response.json();
            setAllTasks(
                allTasks.map((d: any) => {
                    if (d.id === task.id) {
                        return updatedTask;
                    }
                    return d;
                }),
            );
        } catch (err: any) {
            showMessage(err.message, 'error');
        }
    };

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-lg">Loading tasks...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="rounded-lg bg-red-100 p-4 text-red-700">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="relative flex h-full gap-5 sm:h-[calc(100vh_-_150px)]">
                <div
                    className={`panel absolute z-10 hidden h-full w-[240px] max-w-full flex-none space-y-4 p-4 ltr:rounded-r-none rtl:rounded-l-none xl:relative xl:block xl:h-auto ltr:xl:rounded-r-md rtl:xl:rounded-l-md ${
                        isShowTaskMenu && '!block'
                    }`}
                >
                    <div className="flex h-full flex-col pb-16">
                        <div className="pb-5">
                            <div className="flex items-center text-center">
                                <div className="shrink-0">
                                    <IconClipboardText />
                                </div>
                                <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Todo list</h3>
                            </div>
                        </div>
                        <div className="mb-5 h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                        <PerfectScrollbar className="relative h-full grow ltr:-mr-3.5 ltr:pr-3.5 rtl:-ml-3.5 rtl:pl-3.5">
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${
                                        selectedTab === '' ? 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary' : ''
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('');
                                    }}
                                >
                                    <div className="flex items-center">
                                        <IconListCheck className="h-4.5 w-4.5 shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">Inbox</div>
                                    </div>
                                    <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                                        {allTasks && allTasks.filter((d) => d.status !== 'trash').length}
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${
                                        selectedTab === 'complete' && 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('complete');
                                    }}
                                >
                                    <div className="flex items-center">
                                        <IconThumbUp className="h-5 w-5 shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">Done</div>
                                    </div>
                                    <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                                        {allTasks && allTasks.filter((d) => d.status === 'complete').length}
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${
                                        selectedTab === 'important' && 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('important');
                                    }}
                                >
                                    <div className="flex items-center">
                                        <IconStar className="shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">Important</div>
                                    </div>
                                    <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                                        {allTasks && allTasks.filter((d) => d.status === 'important').length}
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${
                                        selectedTab === 'trash' && 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('trash');
                                    }}
                                >
                                    <div className="flex items-center">
                                        <IconTrashLines className="shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">Trash</div>
                                    </div>
                                </button>
                                <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                                <div className="px-1 py-3 text-white-dark">Tags</div>
                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center rounded-md p-1 font-medium text-success duration-300 hover:bg-white-dark/10 ltr:hover:pl-3 rtl:hover:pr-3 dark:hover:bg-[#181F32] ${
                                        selectedTab === 'team' && 'bg-gray-100 ltr:pl-3 rtl:pr-3 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('team');
                                    }}
                                >
                                    <IconSquareRotated className="shrink-0 fill-success" />
                                    <div className="ltr:ml-3 rtl:mr-3">Team</div>
                                </button>
                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center rounded-md p-1 font-medium text-warning duration-300 hover:bg-white-dark/10 ltr:hover:pl-3 rtl:hover:pr-3 dark:hover:bg-[#181F32] ${
                                        selectedTab === 'low' && 'bg-gray-100 ltr:pl-3 rtl:pr-3 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('low');
                                    }}
                                >
                                    <IconSquareRotated className="shrink-0 fill-warning" />
                                    <div className="ltr:ml-3 rtl:mr-3">Low</div>
                                </button>

                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center rounded-md p-1 font-medium text-primary duration-300 hover:bg-white-dark/10 ltr:hover:pl-3 rtl:hover:pr-3 dark:hover:bg-[#181F32] ${
                                        selectedTab === 'medium' && 'bg-gray-100 ltr:pl-3 rtl:pr-3 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('medium');
                                    }}
                                >
                                    <IconSquareRotated className="shrink-0 fill-primary" />
                                    <div className="ltr:ml-3 rtl:mr-3">Medium</div>
                                </button>
                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center rounded-md p-1 font-medium text-danger duration-300 hover:bg-white-dark/10 ltr:hover:pl-3 rtl:hover:pr-3 dark:hover:bg-[#181F32] ${
                                        selectedTab === 'high' && 'bg-gray-100 ltr:pl-3 rtl:pr-3 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('high');
                                    }}
                                >
                                    <IconSquareRotated className="shrink-0 fill-danger" />
                                    <div className="ltr:ml-3 rtl:mr-3">High</div>
                                </button>
                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center rounded-md p-1 font-medium text-info duration-300 hover:bg-white-dark/10 ltr:hover:pl-3 rtl:hover:pr-3 dark:hover:bg-[#181F32] ${
                                        selectedTab === 'update' && 'bg-gray-100 ltr:pl-3 rtl:pr-3 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('update');
                                    }}
                                >
                                    <IconSquareRotated className="shrink-0 fill-info" />
                                    <div className="ltr:ml-3 rtl:mr-3">Update</div>
                                </button>
                            </div>
                        </PerfectScrollbar>
                        <div className="absolute bottom-0 w-full p-4 ltr:left-0 rtl:right-0">
                            <button className="btn btn-primary w-full" type="button" onClick={() => addEditTask()}>
                                <IconPlus className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                Add New Task
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 ${isShowTaskMenu && '!block xl:!hidden'}`} onClick={() => setIsShowTaskMenu(!isShowTaskMenu)}></div>
                <div className="panel h-full flex-1 overflow-auto p-0">
                    <div className="flex h-full flex-col">
                        <div className="flex w-full flex-col gap-4 p-4 sm:flex-row sm:items-center">
                            <div className="flex items-center ltr:mr-3 rtl:ml-3">
                                <button type="button" className="block hover:text-primary ltr:mr-3 rtl:ml-3 xl:hidden" onClick={() => setIsShowTaskMenu(!isShowTaskMenu)}>
                                    <IconMenu />
                                </button>
                                <div className="group relative flex-1">
                                    <input
                                        type="text"
                                        className="peer form-input ltr:!pr-10 rtl:!pl-10"
                                        placeholder="Search Task..."
                                        value={searchTask}
                                        onChange={(e) => setSearchTask(e.target.value)}
                                        onKeyUp={() => searchTasks()}
                                    />
                                    <div className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]">
                                        <IconSearch />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-1 items-center justify-center sm:flex-auto sm:justify-end">
                                <p className="ltr:mr-3 rtl:ml-3">{pager.startIndex + 1 + '-' + (pager.endIndex + 1) + ' of ' + filteredTasks.length}</p>
                                <button
                                    type="button"
                                    disabled={pager.currentPage === 1}
                                    className="rounded-md bg-[#f4f4f4] p-1 enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 ltr:mr-3 rtl:ml-3 dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30"
                                    onClick={() => {
                                        pager.currentPage--;
                                        searchTasks(false);
                                    }}
                                >
                                    <IconCaretDown className="h-5 w-5 rotate-90 rtl:-rotate-90" />
                                </button>
                                <button
                                    type="button"
                                    disabled={pager.currentPage === pager.totalPages}
                                    className="rounded-md bg-[#f4f4f4] p-1 enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30"
                                    onClick={() => {
                                        pager.currentPage++;
                                        searchTasks(false);
                                    }}
                                >
                                    <IconCaretDown className="h-5 w-5 -rotate-90 rtl:rotate-90" />
                                </button>
                            </div>
                        </div>
                        <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>

                        {pagedTasks.length ? (
                            <div className="table-responsive min-h-[400px] grow overflow-y-auto sm:min-h-[300px]">
                                <table className="table-hover">
                                    <tbody>
                                        {pagedTasks.map((task: TodoItem) => {
                                            return (
                                                <tr className={`group cursor-pointer ${task.status === 'complete' ? 'bg-white-light/30 dark:bg-[#1a2941] ' : ''}`} key={task.id}>
                                                    <td className="w-1">
                                                        <input
                                                            type="checkbox"
                                                            id={`chk-${task.id}`}
                                                            className="form-checkbox"
                                                            disabled={selectedTab === 'trash'}
                                                            onClick={() => taskComplete(task)}
                                                            defaultChecked={task.status === 'complete'}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div onClick={() => viewTask(task)}>
                                                            <div className={`whitespace-nowrap text-base font-semibold group-hover:text-primary ${task.status === 'complete' ? 'line-through' : ''}`}>
                                                                {task.title}
                                                            </div>
                                                            <div className={`line-clamp-1 min-w-[300px] overflow-hidden text-white-dark ${task.status === 'complete' ? 'line-through' : ''}`}>
                                                                {task.descriptionText}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="w-1">
                                                        <div className="flex items-center space-x-2 ltr:justify-end rtl:justify-start rtl:space-x-reverse">
                                                            {task.priority && (
                                                                <div className="dropdown">
                                                                    <Dropdown
                                                                        offset={[0, 5]}
                                                                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                                        btnClassName="align-middle"
                                                                        button={
                                                                            <span
                                                                                className={`badge rounded-full capitalize hover:top-0 hover:text-white ${
                                                                                    task.priority === 'medium'
                                                                                        ? 'badge-outline-primary hover:bg-primary'
                                                                                        : task.priority === 'low'
                                                                                          ? 'badge-outline-warning hover:bg-warning'
                                                                                          : task.priority === 'high'
                                                                                            ? 'badge-outline-danger hover:bg-danger'
                                                                                            : ''
                                                                                }`}
                                                                            >
                                                                                {task.priority}
                                                                            </span>
                                                                        }
                                                                    >
                                                                        <ul className="text-medium text-sm">
                                                                            <li>
                                                                                <button type="button" className="text-danger ltr:text-left rtl:text-right" onClick={() => setPriority(task, 'high')}>
                                                                                    High
                                                                                </button>
                                                                            </li>
                                                                            <li>
                                                                                <button type="button" className="text-primary ltr:text-left rtl:text-right" onClick={() => setPriority(task, 'medium')}>
                                                                                    Medium
                                                                                </button>
                                                                            </li>
                                                                            <li>
                                                                                <button type="button" className="text-warning ltr:text-left rtl:text-right" onClick={() => setPriority(task, 'low')}>
                                                                                    Low
                                                                                </button>
                                                                            </li>
                                                                        </ul>
                                                                    </Dropdown>
                                                                </div>
                                                            )}

                                                            {task.tag && (
                                                                <div className="dropdown">
                                                                    <Dropdown
                                                                        offset={[0, 5]}
                                                                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                                        btnClassName="align-middle"
                                                                        button={
                                                                            <span
                                                                                className={`badge rounded-full capitalize hover:top-0 hover:text-white ${
                                                                                    task.tag === 'team'
                                                                                        ? 'badge-outline-success hover:bg-success'
                                                                                        : task.tag === 'update'
                                                                                          ? 'badge-outline-info hover:bg-info'
                                                                                          : ''
                                                                                }`}
                                                                            >
                                                                                {task.tag}
                                                                            </span>
                                                                        }
                                                                    >
                                                                        <ul className="text-medium text-sm">
                                                                            <li>
                                                                                <button type="button" className="text-success" onClick={() => setTag(task, 'team')}>
                                                                                    Team
                                                                                </button>
                                                                            </li>
                                                                            <li>
                                                                                <button type="button" className="text-info" onClick={() => setTag(task, 'update')}>
                                                                                    Update
                                                                                </button>
                                                                            </li>
                                                                            <li>
                                                                                <button type="button" onClick={() => setTag(task, '')}>
                                                                                    None
                                                                                </button>
                                                                            </li>
                                                                        </ul>
                                                                    </Dropdown>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="w-1">
                                                        <p className={`whitespace-nowrap font-medium text-white-dark ${task.status === 'complete' ? 'line-through' : ''}`}>{task.date}</p>
                                                    </td>
                                                    <td className="w-1">
                                                        <div className="flex w-max items-center justify-between">
                                                            <div className="dropdown">
                                                                <Dropdown
                                                                    offset={[0, 5]}
                                                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                                    btnClassName="align-middle"
                                                                    button={<IconHorizontalDots className="rotate-90 opacity-70" />}
                                                                >
                                                                    <ul className="whitespace-nowrap">
                                                                        {selectedTab !== 'trash' && (
                                                                            <>
                                                                                <li>
                                                                                    <button type="button" onClick={() => addEditTask(task)}>
                                                                                        <IconPencilPaper className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                                                                        Edit
                                                                                    </button>
                                                                                </li>
                                                                                <li>
                                                                                    <button type="button" onClick={() => deleteTask(task, 'delete')}>
                                                                                        <IconTrashLines className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                                                                        Delete
                                                                                    </button>
                                                                                </li>
                                                                                <li>
                                                                                    <button type="button" onClick={() => setImportant(task)}>
                                                                                        <IconStar className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                                                                        <span>{task.status === 'important' ? 'Not Important' : 'Important'}</span>
                                                                                    </button>
                                                                                </li>
                                                                            </>
                                                                        )}
                                                                        {selectedTab === 'trash' && (
                                                                            <>
                                                                                <li>
                                                                                    <button type="button" onClick={() => deleteTask(task, 'deletePermanent')}>
                                                                                        <IconTrashLines className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                                                                        Permanent Delete
                                                                                    </button>
                                                                                </li>
                                                                                <li>
                                                                                    <button type="button" onClick={() => deleteTask(task, 'restore')}>
                                                                                        <IconRestore className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                                                                        Restore Task
                                                                                    </button>
                                                                                </li>
                                                                            </>
                                                                        )}
                                                                    </ul>
                                                                </Dropdown>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex h-full min-h-[400px] items-center justify-center text-lg font-semibold sm:min-h-[300px]">No data available</div>
                        )}
                    </div>
                </div>

                <Transition appear show={addTaskModal} as={Fragment}>
                    <Dialog as="div" open={addTaskModal} onClose={() => setAddTaskModal(false)} className="relative z-50">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-[black]/60" />
                        </TransitionChild>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center px-4 py-8">
                                <TransitionChild
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <DialogPanel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                        <button
                                            type="button"
                                            onClick={() => setAddTaskModal(false)}
                                            className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                        >
                                            <IconX />
                                        </button>
                                        <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                            {params.id ? 'Edit Task' : 'Add Task'}
                                        </div>
                                        <div className="p-5">
                                            <form>
                                                <div className="mb-5">
                                                    <label htmlFor="title">Title</label>
                                                    <input id="title" type="text" placeholder="Enter Task Title" className="form-input" value={params.title} onChange={(e) => changeValue(e)} />
                                                </div>
                                                <div className="mb-5 flex justify-between gap-4">
                                                    <div className="flex-1">
                                                        <label htmlFor="tag">Tag</label>
                                                        <select id="tag" className="form-select" value={params.tag} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Tag</option>
                                                            <option value="team">Team</option>
                                                            <option value="update">Update</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex-1">
                                                        <label htmlFor="priority">Priority</label>
                                                        <select id="priority" className="form-select" value={params.priority} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Priority</option>
                                                            <option value="low">Low</option>
                                                            <option value="medium">Medium</option>
                                                            <option value="high">High</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="mb-5">
                                                    <label>Description</label>
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={params.description}
                                                        defaultValue={params.description}
                                                        onChange={(content, delta, source, editor) => {
                                                            params.description = content;
                                                            params.descriptionText = editor.getText();
                                                            setParams({
                                                                ...params,
                                                            });
                                                        }}
                                                        style={{ minHeight: '200px' }}
                                                    />
                                                </div>
                                                <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setAddTaskModal(false)}>
                                                        Cancel
                                                    </button>
                                                    <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => saveTask()}>
                                                        {params.id ? 'Update' : 'Add'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </DialogPanel>
                                </TransitionChild>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

                <Transition appear show={viewTaskModal} as={Fragment}>
                    <Dialog as="div" open={viewTaskModal} onClose={() => setViewTaskModal(false)} className="relative z-50">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-[black]/60" />
                        </TransitionChild>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center px-4 py-8">
                                <TransitionChild
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <DialogPanel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                        <button
                                            type="button"
                                            onClick={() => setViewTaskModal(false)}
                                            className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                        >
                                            <IconX />
                                        </button>
                                        <div className="flex flex-wrap items-center gap-2 bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                            <div>{selectedTask.title}</div>
                                            {selectedTask.priority && (
                                                <div
                                                    className={`badge rounded-3xl capitalize ${
                                                        selectedTask.priority === 'medium'
                                                            ? 'badge-outline-primary'
                                                            : selectedTask.priority === 'low'
                                                              ? 'badge-outline-warning '
                                                              : selectedTask.priority === 'high'
                                                                ? 'badge-outline-danger '
                                                                : ''
                                                    }`}
                                                >
                                                    {selectedTask.priority}
                                                </div>
                                            )}
                                            {selectedTask.tag && (
                                                <div
                                                    className={`badge rounded-3xl capitalize ${
                                                        selectedTask.tag === 'team' ? 'badge-outline-success' : selectedTask.tag === 'update' ? 'badge-outline-info ' : ''
                                                    }`}
                                                >
                                                    {selectedTask.tag}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <div
                                                className="prose text-base"
                                                dangerouslySetInnerHTML={{
                                                    __html: selectedTask.description,
                                                }}
                                            ></div>
                                            <div className="mt-8 flex items-center justify-end">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setViewTaskModal(false)}>
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </DialogPanel>
                                </TransitionChild>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </div>
    );
};

export default ComponentsAppsTodoList;
