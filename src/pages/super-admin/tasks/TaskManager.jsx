import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  CheckSquare,
  Filter,
  Plus,
  Search,
  Calendar,
  Clock,
  X,
  Phone,
  Video,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Settings,
  Menu,
  SquareArrowOutUpRight,
  SlidersHorizontal,
  ListTodo,
  Building2,
  KeyRound,
  User,
  Megaphone,
  ReceiptText,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getStoredUsers,
  getLoggedInUser,
  getUserTier,
  filterTasksByRole,
  isSalesExecutive
} from '../../../utils/userDirectory';

export default function TaskManager({
  employees = [],
  customers = [],
  leads = []
}) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('alzaydan_current_user');
      return stored ? JSON.parse(stored) : getLoggedInUser();
    } catch {
      return getLoggedInUser();
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem('alzaydan_current_user');
        if (stored) setCurrentUser(JSON.parse(stored));
      } catch {}
    };
    window.addEventListener('alzaydan_user_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('alzaydan_user_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const isSalesExec = isSalesExecutive(currentUser);
  const userTier = getUserTier(currentUser);

  // Available real users from directory
  const availableUsers = useMemo(() => {
    const stored = getStoredUsers();
    if (employees && employees.length > 0) {
      const merged = [...stored];
      employees.forEach((emp) => {
        if (emp.name && !merged.some((m) => m.name.toLowerCase() === emp.name.toLowerCase())) {
          merged.push(emp);
        }
      });
      return merged;
    }
    return stored;
  }, [employees]);

  const defaultAssignee = isSalesExec
    ? currentUser?.name || 'muhammed shibil'
    : availableUsers[0]?.name || 'Super Admin';

  // Dynamic Assignee list from real current users
  const assigneeOptions = useMemo(() => {
    const names = [];
    availableUsers.forEach((u) => {
      if (u.name && !names.includes(u.name)) names.push(u.name);
    });
    return names.length > 0 ? names : ['Super Admin'];
  }, [availableUsers]);

  const taskUnderOptions = useMemo(() => {
    const list = [];
    leads.forEach((l) => {
      if (l.company && !list.includes(l.company)) list.push(l.company);
    });
    customers.forEach((c) => {
      if (c.name && !list.includes(c.name)) list.push(c.name);
    });
    return list;
  }, [leads, customers]);
  // Primary status tab filter (matching Image 2 top bar)
  const [activeStatusTab, setActiveStatusTab] = useState('All');
  const [subTypeTab, setSubTypeTab] = useState('All'); // 'All' | 'Followup' | 'Call'
  const [showFilterSidebar, setShowFilterSidebar] = useState(true);

  // Filter dropdown states
  const [sortBy, setSortBy] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedTaskType, setSelectedTaskType] = useState('all');
  const [selectedCreatedBy, setSelectedCreatedBy] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [openTaskMenuId, setOpenTaskMenuId] = useState(null);
  const [selectedTaskForAction, setSelectedTaskForAction] = useState(null);
  const [taskActionDialog, setTaskActionDialog] = useState(null);
  const [postponeDate, setPostponeDate] = useState('');
  const [postponeTime, setPostponeTime] = useState('');
  const [statusDraft, setStatusDraft] = useState('Pending');
  const [statusDueDate, setStatusDueDate] = useState('');
  const [statusDueTime, setStatusDueTime] = useState('');
  const [statusPriority, setStatusPriority] = useState('Medium');
  const [statusComments, setStatusComments] = useState('');
  const [statusAddNote, setStatusAddNote] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const modalMode = 'create'; // 'create' | 'assign'

  // View Mode: 'list' (Image 1/2) | 'assign' (Image 3) | 'add-task' (Image 2)
  const [viewMode, setViewMode] = useState('list');

  // Inline Add Task state matching Image 2 ("ADD GENERIC TASK")
  const [activeAddTaskType, setActiveAddTaskType] = useState('Generic Task');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateOptions, setTemplateOptions] = useState([
    'Commercial Client Followup',
    'Site Survey & Chiller Audit',
    'Quotation Followup Call',
    'Payment Collection Notice',
    'Delivery Confirmation & Handover',
    'Maintenance & AMC Renewal'
  ]);
  const [isAddTemplateModalOpen, setIsAddTemplateModalOpen] = useState(false);
  const [newTemplateInput, setNewTemplateInput] = useState('');
  const [inlineTaskTitle, setInlineTaskTitle] = useState('');
  const [inlineTaskDesc, setInlineTaskDesc] = useState('');
  const [inlineAssignee, setInlineAssignee] = useState(defaultAssignee);
  const [inlineTaskUnder, setInlineTaskUnder] = useState('');
  const [inlinePriority, setInlinePriority] = useState('Medium');
  const [inlineDueDate, setInlineDueDate] = useState('');

  // Task creation dropdown state (+ TASK ▾ / ▴ matching Image 1)
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
  const taskDropdownRef = useRef(null);

  // Assign Task view filters & state (matching Image 3)
  const [assignSortBy, setAssignSortBy] = useState('All Task');
  const [assignAssignee, setAssignAssignee] = useState('All Owners');
  const [assignTaskType, setAssignTaskType] = useState('All');
  const [assignCreatedBy, setAssignCreatedBy] = useState('All');
  const [assignTaskStatus, setAssignTaskStatus] = useState('All');
  const [assignTaskDue, setAssignTaskDue] = useState('');
  const [assignSearchQuery, setAssignSearchQuery] = useState('');
  const [assignRowsPerPage, setAssignRowsPerPage] = useState(10);
  const [assignCurrentPage, setAssignCurrentPage] = useState(1);
  const [assignHasLoaded, setAssignHasLoaded] = useState(true);

  // Applied filters on clicking "Load" in Assign Mode
  const [appliedAssignFilters, setAppliedAssignFilters] = useState({
    sortBy: 'All Task',
    assignee: 'All Owners',
    taskType: 'All',
    createdBy: 'All',
    taskStatus: 'All',
    taskDue: ''
  });

  // Selected tasks for assignment
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [bulkAssignee, setBulkAssignee] = useState('');

  // Dropdown options matching Image 1
  const taskTypeDropdownItems = useMemo(
    () => [
      { label: 'Generic Task', type: 'Generic', icon: SlidersHorizontal },
      { label: 'Lead Task', type: 'Lead', icon: ListTodo },
      { label: 'Customer Task', type: 'Customer', icon: Building2 },
      { label: 'Opportunity Task', type: 'Opportunity', icon: KeyRound },
      { label: 'Contact Task', type: 'Contact', icon: User },
      { label: 'Campaign Task', type: 'Campaign', icon: Megaphone },
      { label: 'Invoice Task', type: 'Invoice', icon: ReceiptText },
      { label: 'Standard Task Form', type: 'Standard', icon: CheckCircle2 }
    ],
    []
  );

  // Close + TASK dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (taskDropdownRef.current && !taskDropdownRef.current.contains(e.target)) {
        setIsTaskDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // New task form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: defaultAssignee,
    taskUnder: 'Gulf Logistics Hub',
    taskType: 'Followup',
    priority: 'High',
    dueDate: 'Nov 18, 2026, 04:00 PM',
    status: 'Pending'
  });

  // Live commercial task records (Clean state with 0 mock data)
  const [taskList, setTaskList] = useState(() => {
    try {
      const savedTasks = localStorage.getItem('alzaydan_crm_task_list');
      const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];
      return Array.isArray(parsedTasks) ? parsedTasks.map((task) => ({ ...task, dueDate: task.dueDate || '2026-11-18 10:00 AM' })) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('alzaydan_crm_task_list', JSON.stringify(taskList));
    } catch (error) {
      console.error('Unable to save tasks locally', error);
    }
  }, [taskList]);

  // Role-Based Task Visibility: Filter tasks based on organizational hierarchy
  const visibleTasks = useMemo(() => {
    return filterTasksByRole(taskList, currentUser);
  }, [taskList, currentUser]);

  // Dynamic counts for status ribbon matching Reference Image 2
  const statusCounts = useMemo(() => {
    return {
      all: visibleTasks.length,
      today: visibleTasks.filter((t) => t.status === 'Today' && !t.completed).length,
      pending: visibleTasks.filter((t) => t.status === 'Pending' && !t.completed).length,
      progress: visibleTasks.filter((t) => t.status === 'Progress' && !t.completed).length,
      overdue: visibleTasks.filter((t) => t.status === 'Overdue' && !t.completed).length,
      upcoming: visibleTasks.filter((t) => t.status === 'Upcoming' && !t.completed).length,
      completed: visibleTasks.filter((t) => t.completed).length,
      meeting: visibleTasks.filter((t) => t.taskType === 'Meeting').length,
      followup: visibleTasks.filter((t) => t.taskType === 'Followup').length,
      call: visibleTasks.filter((t) => t.taskType === 'Call').length
    };
  }, [visibleTasks]);

  // Reset all filters
  const handleResetFilters = () => {
    setSortBy('all');
    setSelectedAssignee('all');
    setSelectedTaskType('all');
    setSelectedCreatedBy('all');
    setSearchQuery('');
    setActiveStatusTab('All');
    setSubTypeTab('All');
    setCurrentPage(1);
    toast.info('Task filters reset to default');
  };

  // Toggle completion
  const handleToggleComplete = (id) => {
    setTaskList((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.completed;
          toast.success(
            nextState ? `Task completed: "${t.title}"` : `Task reopened: "${t.title}"`
          );
          return {
            ...t,
            completed: nextState,
            status: nextState ? 'Completed' : 'Pending'
          };
        }
        return t;
      })
    );
  };

  // Delete task
  const handleDeleteTask = (id, title) => {
    setTaskList((prev) => prev.filter((t) => t.id !== id));
    toast.success(`Deleted task: "${title}"`);
  };

  // Create or Assign Task Submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const taskUpdates = {
      title: formData.title.trim(),
      description: formData.description.trim() || 'No additional notes provided.',
      assignee: formData.assignee,
      taskUnder: formData.taskUnder,
      taskType: formData.taskType,
      dueDate: formData.dueDate,
      status: formData.status,
      priority: formData.priority,
      completed: formData.status === 'Completed'
    };

    if (editingTaskId !== null) {
      setTaskList((prev) => prev.map((task) => task.id === editingTaskId ? { ...task, ...taskUpdates } : task));
      toast.success('Task updated successfully');
      setEditingTaskId(null);
      setIsCreateModalOpen(false);
      return;
    }

    const newTask = {
      id: Date.now(),
      ...taskUpdates,
      assignee: formData.assignee,
      assigneeRole: 'Assigned Specialist',
      avatarBg: 'bg-[#011635] text-white',
      createdBy: currentUser?.name || 'Super Admin',
      creatorRole: currentUser?.role || 'Super Admin'
    };

    setTaskList((prev) => [newTask, ...prev]);
    toast.success(`Task successfully created and assigned to ${formData.assignee}!`);
    setIsCreateModalOpen(false);
    setFormData({
      title: '',
      description: '',
      assignee: defaultAssignee,
      taskUnder: 'Gulf Logistics Hub',
      taskType: 'Followup',
      priority: 'High',
      dueDate: 'Nov 18, 2026, 04:00 PM',
      status: 'Pending'
    });
  };

  // Filtered task results
  const filteredTasks = useMemo(() => {
    return visibleTasks
      .filter((task) => {
        // Status tab filter
        if (activeStatusTab === 'Today' && (task.status !== 'Today' || task.completed)) return false;
        if (activeStatusTab === 'Pending' && (task.status !== 'Pending' || task.completed)) return false;
        if (activeStatusTab === 'Progress' && (task.status !== 'Progress' || task.completed)) return false;
        if (activeStatusTab === 'Overdue' && (task.status !== 'Overdue' || task.completed)) return false;
        if (activeStatusTab === 'Upcoming' && (task.status !== 'Upcoming' || task.completed)) return false;
        if (activeStatusTab === 'Completed' && !task.completed) return false;
        if (activeStatusTab === 'Meeting' && task.taskType !== 'Meeting') return false;

        // SubType tab filter (Followup / Call)
        if (subTypeTab === 'Followup' && task.taskType !== 'Followup') return false;
        if (subTypeTab === 'Call' && task.taskType !== 'Call') return false;

        // Dropdown filters
        if (selectedAssignee !== 'all' && task.assignee !== selectedAssignee) return false;
        if (selectedTaskType !== 'all' && task.taskType !== selectedTaskType) return false;
        if (selectedCreatedBy !== 'all' && task.createdBy !== selectedCreatedBy) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchAssignee = task.assignee.toLowerCase().includes(q);
          const matchUnder = task.taskUnder.toLowerCase().includes(q);
          if (!matchTitle && !matchAssignee && !matchUnder) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const weights = { High: 3, Medium: 2, Low: 1 };
          return (weights[b.priority] || 0) - (weights[a.priority] || 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return b.id - a.id;
      });
  }, [
    visibleTasks,
    activeStatusTab,
    subTypeTab,
    selectedAssignee,
    selectedTaskType,
    selectedCreatedBy,
    searchQuery,
    sortBy
  ]);

  // Dynamic pagination calculation
  const totalPages = Math.ceil(filteredTasks.length / rowsPerPage) || 1;
  const pagedTasks = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredTasks.slice(start, start + rowsPerPage);
  }, [filteredTasks, currentPage, rowsPerPage]);

  // Handle task selection from Image 1 "+ TASK" dropdown -> Opens Image 2 ("ADD GENERIC TASK" inline view)
  const handleSelectTaskDropdownItem = (item) => {
    setIsTaskDropdownOpen(false);
    setActiveAddTaskType(item.label);
    setSelectedTemplate('');
    setInlineTaskTitle('');
    setInlineTaskDesc('');
    setInlineAssignee(defaultAssignee);
    setInlineTaskUnder('');
    setInlinePriority('Medium');
    setInlineDueDate('');
    setViewMode('add-task');
  };

  // Submit Handler for Image 2 Inline Task Form
  const handleInlineTaskSubmit = (e) => {
    e.preventDefault();
    if (!selectedTemplate) {
      toast.error('Please select a template to continue');
      return;
    }

    const newTask = {
      id: Date.now(),
      title: inlineTaskTitle || `${activeAddTaskType}: ${selectedTemplate}`,
      description: inlineTaskDesc || `Task executed under ${selectedTemplate} workflow.`,
      assignee: inlineAssignee || defaultAssignee,
      assigneeRole: isSalesExec ? 'Sales Executive' : 'Specialist',
      avatarBg: 'bg-[#011635] text-white',
      taskUnder: inlineTaskUnder || 'Gulf Logistics Hub',
      taskType: activeAddTaskType.replace(' Task', ''),
      createdBy: currentUser?.name || 'Super Admin',
      creatorRole: currentUser?.role || 'Super Admin',
      priority: inlinePriority,
      priorityColor:
        inlinePriority === 'Urgent'
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : inlinePriority === 'High'
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : 'bg-blue-50 text-blue-700 border-blue-200',
      dueDate: inlineDueDate,
      status: 'Pending',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      completed: false,
      callType: 'Outbound',
      phone: '+971 50 123 4567',
      contactPerson: 'Director'
    };

    setTaskList((prev) => [newTask, ...prev]);
    toast.success(`${activeAddTaskType} created successfully from template "${selectedTemplate}"!`);
    setSelectedTemplate('');
    setInlineTaskTitle('');
    setInlineTaskDesc('');
    setViewMode('list');
  };

  // Create Template Handler
  const handleAddNewTemplateSubmit = (e) => {
    e.preventDefault();
    if (!newTemplateInput.trim()) return;
    const name = newTemplateInput.trim();
    if (!templateOptions.includes(name)) {
      setTemplateOptions((prev) => [...prev, name]);
    }
    setSelectedTemplate(name);
    setInlineTaskTitle(`${activeAddTaskType}: ${name}`);
    setInlineTaskDesc(`Task executed under ${name} workflow.`);
    setNewTemplateInput('');
    setIsAddTemplateModalOpen(false);
    toast.success(`Template "${name}" added and selected!`);
  };

  // Filtered tasks for Assign Mode (Image 3)
  const handleLoadAssignTasks = () => {
    setAppliedAssignFilters({
      sortBy: assignSortBy,
      assignee: assignAssignee,
      taskType: assignTaskType,
      createdBy: assignCreatedBy,
      taskStatus: assignTaskStatus,
      taskDue: assignTaskDue
    });
    setAssignHasLoaded(true);
    setAssignCurrentPage(1);
    toast.info('Tasks reloaded matching filter criteria');
  };

  const filteredAssignTasks = useMemo(() => {
    if (!assignHasLoaded) return [];

    return visibleTasks
      .filter((task) => {
        // Assignee
        if (
          appliedAssignFilters.assignee !== 'All Owners' &&
          task.assignee !== appliedAssignFilters.assignee
        ) {
          return false;
        }
        // Task Type
        if (
          appliedAssignFilters.taskType !== 'All' &&
          task.taskType !== appliedAssignFilters.taskType
        ) {
          return false;
        }
        // Created By
        if (
          appliedAssignFilters.createdBy !== 'All' &&
          task.createdBy !== appliedAssignFilters.createdBy
        ) {
          return false;
        }
        // Task Status
        if (appliedAssignFilters.taskStatus !== 'All') {
          if (appliedAssignFilters.taskStatus === 'Completed' && !task.completed) return false;
          if (
            appliedAssignFilters.taskStatus === 'Pending' &&
            (task.status !== 'Pending' || task.completed)
          ) {
            return false;
          }
          if (
            appliedAssignFilters.taskStatus === 'Progress' &&
            (task.status !== 'Progress' || task.completed)
          ) {
            return false;
          }
          if (
            appliedAssignFilters.taskStatus === 'Overdue' &&
            (task.status !== 'Overdue' || task.completed)
          ) {
            return false;
          }
        }
        // Task Due Date substring match
        if (appliedAssignFilters.taskDue.trim()) {
          if (
            !task.dueDate
              .toLowerCase()
              .includes(appliedAssignFilters.taskDue.trim().toLowerCase())
          ) {
            return false;
          }
        }
        // Search Query
        if (assignSearchQuery.trim()) {
          const q = assignSearchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchAssignee = task.assignee.toLowerCase().includes(q);
          const matchUnder = task.taskUnder.toLowerCase().includes(q);
          if (!matchTitle && !matchAssignee && !matchUnder) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (appliedAssignFilters.sortBy === 'Due Date Ascending') {
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (appliedAssignFilters.sortBy === 'Due Date Descending') {
          return b.dueDate.localeCompare(a.dueDate);
        }
        if (appliedAssignFilters.sortBy === 'High Priority') {
          const weights = { High: 3, Medium: 2, Low: 1 };
          return (weights[b.priority] || 0) - (weights[a.priority] || 0);
        }
        if (appliedAssignFilters.sortBy === 'Low Priority') {
          const weights = { High: 3, Medium: 2, Low: 1 };
          return (weights[a.priority] || 0) - (weights[b.priority] || 0);
        }
        return b.id - a.id;
      });
  }, [visibleTasks, assignHasLoaded, appliedAssignFilters, assignSearchQuery]);

  const totalAssignPages = Math.ceil(filteredAssignTasks.length / assignRowsPerPage) || 1;
  const pagedAssignTasks = useMemo(() => {
    const start = (assignCurrentPage - 1) * assignRowsPerPage;
    return filteredAssignTasks.slice(start, start + assignRowsPerPage);
  }, [filteredAssignTasks, assignCurrentPage, assignRowsPerPage]);

  const allPagedSelected = useMemo(() => {
    if (pagedAssignTasks.length === 0) return false;
    return pagedAssignTasks.every((t) => selectedTaskIds.includes(t.id));
  }, [pagedAssignTasks, selectedTaskIds]);

  const handleToggleSelectAll = () => {
    if (allPagedSelected) {
      const pageIds = pagedAssignTasks.map((t) => t.id);
      setSelectedTaskIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = pagedAssignTasks.map((t) => t.id);
      setSelectedTaskIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleTaskSelection = (id) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecuteAssign = () => {
    if (selectedTaskIds.length === 0) {
      toast.warning('Please select at least one task using the checkboxes.');
      return;
    }
    if (!bulkAssignee) {
      toast.warning('Please select a team member from the "Assign To" dropdown.');
      return;
    }

    const count = selectedTaskIds.length;
    setTaskList((prev) =>
      prev.map((t) => {
        if (selectedTaskIds.includes(t.id)) {
          return {
            ...t,
            assignee: bulkAssignee,
            assigneeRole: 'Assigned Specialist',
            avatarBg: 'bg-[#011635] text-white'
          };
        }
        return t;
      })
    );

    toast.success(`Successfully assigned ${count} task(s) to ${bulkAssignee}!`);
    setSelectedTaskIds([]);
    setBulkAssignee('');
  };

  return (
    <div className="space-y-4">
      {/* If viewMode === 'list': Display Top Status Ribbon & Tasks Workspace */}
      {viewMode === 'list' && (
        <>
          {/* ================= TIER 1: TOP STATUS FILTER RIBBON (Exact Match to Image 2) ================= */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-2xs overflow-x-auto flex items-center gap-2.5 scrollbar-none">
        {/* 1. All Tasks */}
        <button
          type="button"
          onClick={() => { setActiveStatusTab('All'); setCurrentPage(1); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeStatusTab === 'All'
              ? 'bg-[#011635] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>All Tasks</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
            activeStatusTab === 'All' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {statusCounts.all}
          </span>
        </button>

        {/* 2. Today */}
        <button
          type="button"
          onClick={() => { setActiveStatusTab('Today'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeStatusTab === 'Today'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB] inline-block" />
          <span>Today</span>
          <span className="px-1.5 py-0.2 rounded-md bg-[#2563EB] text-white text-[10px] font-mono font-bold">
            {statusCounts.today}
          </span>
        </button>

        {/* 3. Pending */}
        <button
          type="button"
          onClick={() => { setActiveStatusTab('Pending'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeStatusTab === 'Pending'
              ? 'bg-[#F97316] text-white font-bold shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Pending</span>
          <span className="px-1.5 py-0.2 rounded-md bg-[#F97316] text-white text-[10px] font-mono font-bold">
            {statusCounts.pending}
          </span>
        </button>

        {/* 4. Progress */}
        <button
          type="button"
          onClick={() => { setActiveStatusTab('Progress'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeStatusTab === 'Progress'
              ? 'bg-[#10B981] text-white font-bold shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full border-2 border-[#10B981] inline-block" />
          <span>Progress</span>
          <span className="px-1.5 py-0.2 rounded-md bg-[#10B981] text-white text-[10px] font-mono font-bold">
            {statusCounts.progress}
          </span>
        </button>

        {/* 5. Overdue */}
        <button
          type="button"
          onClick={() => { setActiveStatusTab('Overdue'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeStatusTab === 'Overdue'
              ? 'bg-[#EF4444] text-white font-bold shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-[#EF4444]" />
          <span>Overdue</span>
          <span className="px-1.5 py-0.2 rounded-md bg-[#EF4444] text-white text-[10px] font-mono font-bold">
            {statusCounts.overdue}
          </span>
        </button>

        {/* 6. Upcoming */}
        <button
          type="button"
          onClick={() => { setActiveStatusTab('Upcoming'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeStatusTab === 'Upcoming'
              ? 'bg-[#0284C7] text-white font-bold shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-[#0284C7]" />
          <span>Upcoming</span>
        </button>

        {/* 7. Completed */}
        <button
          type="button"
          onClick={() => { setActiveStatusTab('Completed'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeStatusTab === 'Completed'
              ? 'bg-[#0D9488] text-white font-bold shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
          <span>Completed</span>
          <span className="px-1.5 py-0.2 rounded-md bg-[#0D9488] text-white text-[10px] font-mono font-bold">
            {statusCounts.completed}
          </span>
        </button>

        {/* 8. Meeting */}
        <button
          type="button"
          onClick={() => { setActiveStatusTab('Meeting'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeStatusTab === 'Meeting'
              ? 'bg-[#E11D48] text-white font-bold shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-[#E11D48]" />
          <span>Meeting</span>
        </button>
      </div>

      {/* ================= TIER 2: MAIN WORKSPACE (Filters Sidebar + Data Table) ================= */}
      <div className={`grid grid-cols-1 gap-4.5 items-start ${showFilterSidebar ? 'lg:grid-cols-[300px_minmax(0,1fr)]' : 'lg:grid-cols-1'}`}>
        {/* Left Filters Panel (Matching Image 2) */}
        {showFilterSidebar && (
          <aside className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>Filters</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:underline transition cursor-pointer"
                  title="Reset Filters to Default"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilterSidebar(false)}
                  className="w-5 h-5 rounded-md bg-[#EF4444] text-white hover:bg-red-600 flex items-center justify-center text-xs font-bold transition cursor-pointer shadow-2xs"
                  title="Close Filters"
                >
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* 1. Sort By Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
              >
                <option value="all">All Task</option>
                <option value="priority">Priority (High to Low)</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            {/* 2. Assignee Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Assignee
              </label>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
              >
                <option value="all">All Owners</option>
                {assigneeOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Task Type Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Task Type
              </label>
              <select
                value={selectedTaskType}
                onChange={(e) => setSelectedTaskType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
              >
                <option value="all">All</option>
                <option value="Followup">Followup</option>
                <option value="Call">Call</option>
                <option value="Meeting">Meeting</option>
              </select>
            </div>

            {/* 4. Created By Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Created By
              </label>
              <select
                value={selectedCreatedBy}
                onChange={(e) => setSelectedCreatedBy(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
              >
                <option value="all">All</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Sales Manager">Sales Manager</option>
                <option value="Team Lead">Team Lead</option>
              </select>
            </div>
          </aside>
        )}

        {/* Right Task Table Container (Matching Image 2) */}
        <section
          className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between min-w-0"
        >
          {/* Top Header Bar inside Table Container */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-sm">
                <Menu className="w-4 h-4 text-[#011635] stroke-[2.5]" />
                <span>All Tasks</span>
              </div>

              {/* Blue Filter Toggle Button (Matching Image 2) */}
              <button
                type="button"
                onClick={() => setShowFilterSidebar(!showFilterSidebar)}
                className="px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs cursor-pointer"
              >
                <Filter className="w-3 h-3" />
                <span>Filter</span>
              </button>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Assign Task (Dark Blue Button with SquareArrowOutUpRight matching Image 1 - Restricted to Admins, Managers & Team Leads) */}
              {!isSalesExec && (
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('assign');
                    setSelectedTaskIds([]);
                    setBulkAssignee('');
                    setAssignHasLoaded(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <SquareArrowOutUpRight className="w-3.5 h-3.5" />
                  <span>Assign Task</span>
                </button>
              )}

              {/* + TASK ▾ / ▴ (Emerald Green Button with Dropdown Matching Image 1) */}
              <div className="relative" ref={taskDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsTaskDropdownOpen((prev) => !prev)}
                  className="px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ TASK</span>
                  {isTaskDropdownOpen ? (
                    <ChevronUp className="w-3 h-3 ml-0.5" />
                  ) : (
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  )}
                </button>

                {isTaskDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    {taskTypeDropdownItems.map((item, idx) => {
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectTaskDropdownItem(item)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#011635] text-left transition cursor-pointer group"
                        >
                          <IconComponent className="w-4 h-4 text-slate-400 group-hover:text-[#011635] shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub Controls: Rows Selector, Followup / Call Sub-tabs, Search */}
          <div className="px-3.5 py-2.5 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 text-xs">
            {/* Left: Shows [10 ▾] Rows */}
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <span>Shows</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>Rows</span>
            </div>

            {/* Middle: Followup (N) | Call (N) Sub-tabs */}
            <div className="flex items-center gap-4 text-xs font-bold sm:col-start-1 sm:row-start-2">
              <button
                type="button"
                onClick={() => {
                  setSubTypeTab(subTypeTab === 'Followup' ? 'All' : 'Followup');
                  setCurrentPage(1);
                }}
                className={`transition cursor-pointer ${
                  subTypeTab === 'Followup'
                    ? 'text-[#D97706] underline underline-offset-4'
                    : 'text-[#D97706]/85 hover:text-[#D97706]'
                }`}
              >
                Followup ({statusCounts.followup})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubTypeTab(subTypeTab === 'Call' ? 'All' : 'Call');
                  setCurrentPage(1);
                }}
                className={`transition cursor-pointer ${
                  subTypeTab === 'Call'
                    ? 'text-[#2563EB] underline underline-offset-4'
                    : 'text-[#2563EB]/85 hover:text-[#2563EB]'
                }`}
              >
                Call ({statusCounts.call})
              </button>
            </div>

            {/* Right: Search Input with magnifying glass on the right */}
            <div className="relative sm:col-start-2 sm:row-span-2 sm:row-start-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Task"
                className="pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 w-44 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Table (Columns match Image 2 exactly) */}
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full min-w-[850px] table-fixed text-left text-xs">
              <thead>
                <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                  <th className="w-[6%] whitespace-nowrap py-3 px-2">SL.NO</th>
                  <th className="w-[13%] whitespace-nowrap py-3 px-2">ASSIGNEE</th>
                  <th className="w-[23%] whitespace-nowrap py-3 px-2">TASK DETAILS</th>
                  <th className="w-[21%] whitespace-nowrap py-3 px-2">TASK UNDER</th>
                  <th className="w-[10%] whitespace-nowrap py-3 px-2">TASK TYPE</th>
                  <th className="w-[13%] whitespace-nowrap py-3 px-2">DUE DATE</th>
                  <th className="w-[7%] whitespace-nowrap py-3 px-2">PRIORITY</th>
                  <th className="w-[8%] whitespace-nowrap py-3 px-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center text-slate-400 font-medium text-xs">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  pagedTasks.map((t, idx) => {
                    const rowNumber = (currentPage - 1) * rowsPerPage + idx + 1;
                    return (
                      <tr
                        key={t.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          t.completed ? 'bg-slate-50/30' : ''
                        }`}
                      >
                        {/* SL.NO */}
                        <td className="py-3 px-3.5 font-mono text-slate-400 font-bold text-[11px]">
                          {String(rowNumber).padStart(2, '0')}
                        </td>

                        {/* ASSIGNEE */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700"
                            >
                              {t.assignee?.trim().charAt(0).toLowerCase() || 's'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-[11px]">
                                {t.assignee}
                              </div>
                              <div className="text-[9px] text-slate-400 leading-none">
                                {t.assigneeRole || 'Specialist'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* TASK DETAILS */}
                        <td className="py-3 px-3">
                          <div className="flex min-w-0 items-center gap-2">
                          <div className={'truncate text-xs font-medium text-slate-700 ' + (t.completed ? 'line-through text-slate-400' : '')}>
                            {t.title}
                          </div>
                          </div>
                          <AlertCircle className="h-4 w-4 shrink-0 text-sky-500" title={t.description} />
                        </td>

                        {/* TASK UNDER */}
                        <td className="py-3 px-3">
                          <div className="space-y-1 whitespace-nowrap text-[11px]">
                            <div className="flex items-center gap-2 font-semibold text-slate-800"><User className="h-4 w-4 text-blue-600" />{t.assignee}<AlertCircle className="h-4 w-4 text-sky-500" /></div>
                            <div className="flex items-center gap-2 text-slate-600"><Clock className="h-4 w-4 text-amber-500" />{String(t.dueDate || '2026-11-18 10:00 AM').match(/\d{1,2}:\d{2}\s?(AM|PM)?/i)?.[0] || '10:00 AM'}</div>
                          </div>
                        </td>

                        {/* TASK TYPE */}
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              t.taskType === 'Followup'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : t.taskType === 'Call'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {t.taskType === 'Call' && <Phone className="w-2.5 h-2.5" />}
                            {t.taskType === 'Meeting' && <Video className="w-2.5 h-2.5" />}
                            {t.taskType === 'Followup' && <Clock className="w-2.5 h-2.5" />}
                            <span>{t.taskType}</span>
                          </span>
                        </td>

                        {/* DUE DATE */}
                        <td className="whitespace-nowrap py-3 px-3">
                          <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-medium">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="whitespace-nowrap leading-tight">
                              <span className="block">{String(t.dueDate || '2026-11-18, 10:00 AM').split(',')[0]}</span>
                              <small className="block text-slate-500">{String(t.dueDate || '2026-11-18, 10:00 AM').split(',')[1]?.trim() || '10:00 AM'}</small>
                            </span>
                          </div>
                        </td>

                        {/* PRIORITY */}
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.priority === 'High'
                              ? 'bg-emerald-500 text-white border border-emerald-500'
                                : t.priority === 'Medium'
                                ? 'bg-amber-400 text-slate-900 border border-amber-400'
                                : 'bg-rose-600 text-white border border-rose-600'
                            }`}
                          >
                            {t.priority === 'Medium' ? 'Mid' : t.priority}
                          </span>
                        </td>

                        {/* ACTION */}
                        <td className="py-3 px-3 text-right">
                          <div className="relative flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setOpenTaskMenuId(openTaskMenuId === t.id ? null : t.id)}
                              className="inline-flex h-7 min-w-[62px] items-center justify-center gap-1 whitespace-nowrap rounded-md bg-[#006b83] px-2 text-white hover:bg-[#00566b] transition cursor-pointer"
                              title="Task actions"
                              aria-label={'Actions for ' + t.title}
                              aria-expanded={openTaskMenuId === t.id}
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <ChevronDown className="w-3 h-3 inline-block ml-1" />
                            </button>
                            {openTaskMenuId === t.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-xl z-50 text-left">
                                <button type="button" onClick={() => { setSelectedTaskForAction(t); setViewMode('detail'); setOpenTaskMenuId(null); }} className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50">View</button>
                                <button type="button" onClick={() => { setFormData({ title: t.title, description: t.description, assignee: t.assignee, taskUnder: t.taskUnder, taskType: t.taskType, priority: t.priority, dueDate: t.dueDate, status: t.status }); setEditingTaskId(t.id); setViewMode('edit-task'); setOpenTaskMenuId(null); }} className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50">Edit</button>
                                <button type="button" onClick={() => { setSelectedTaskForAction(t); setPostponeDate(''); setPostponeTime(''); setTaskActionDialog('postpone'); setOpenTaskMenuId(null); }} className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50">Postpone</button>
                                <button type="button" onClick={() => { const due = new Date(t.dueDate); setSelectedTaskForAction(t); setStatusDraft(t.status || 'Pending'); setStatusDueDate(Number.isNaN(due.getTime()) ? '' : due.toISOString().slice(0, 10)); setStatusDueTime(Number.isNaN(due.getTime()) ? '' : due.toTimeString().slice(0, 5)); setStatusPriority(t.priority || 'Medium'); setStatusComments(''); setStatusAddNote(false); setTaskActionDialog('status'); setOpenTaskMenuId(null); }} className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50">Change Status</button>
                                <button type="button" onClick={() => { handleToggleComplete(t.id); setOpenTaskMenuId(null); }} className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50">Mark as Completed</button>
                                <button type="button" onClick={() => { handleDeleteTask(t.id, t.title); setOpenTaskMenuId(null); }} className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50">Delete</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              Showing {filteredTasks.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to{' '}
              {Math.min(currentPage * rowsPerPage, filteredTasks.length)} of {filteredTasks.length} entries
            </div>

            <div className="flex items-center gap-1 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setCurrentPage(pg)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentPage === pg
                      ? 'bg-[#0055D4] text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pg}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
      </>
    )}

      {viewMode === 'detail' && selectedTaskForAction && (
        <section className="rounded-lg border border-slate-300 bg-white shadow-sm overflow-hidden text-sm">
          <header className="flex items-center justify-between border-b bg-slate-100 px-4 py-3 text-xs font-bold uppercase">
            Task created by {selectedTaskForAction.createdBy || 'Super Admin'}
            <button type="button" onClick={() => setViewMode('list')} className="rounded bg-rose-600 p-1 text-white"><X className="h-4 w-4" /></button>
          </header>
          <nav className="flex gap-5 border-b px-4 py-2.5 text-xs"><span className="border-b-2 border-rose-500 pb-2 font-bold">☰ Task Details</span><span className="text-slate-500">◴ Task History Details</span></nav>
          <div className="grid gap-4 p-4 lg:grid-cols-[3fr_2fr]">
            <div className="overflow-hidden rounded-lg border">
              <h3 className="border-b bg-slate-50 px-3 py-2.5 text-xs font-bold">☰ Task Details</h3>
              {[
                ['Assignee', selectedTaskForAction.assignee], ['Task', selectedTaskForAction.title],
                ['Due Date', selectedTaskForAction.dueDate], ['Status', selectedTaskForAction.status],
                ['Task Under', selectedTaskForAction.taskUnder || 'General Assignment'],
                ['Task Type', selectedTaskForAction.taskType], ['Priority', selectedTaskForAction.priority],
                ['Description', selectedTaskForAction.description]
              ].map(([label, value]) => <div key={label} className="grid grid-cols-[130px_1fr] border-b text-xs"><strong className="bg-slate-50 px-3 py-2.5">{label}</strong><span className="px-3 py-2.5">{value || '—'}</span></div>)}
            </div>
            <div className="overflow-hidden rounded-lg border"><h3 className="border-b bg-slate-50 px-3 py-2.5 text-xs font-bold">ATTACHMENTS</h3><div className="flex h-60 items-center justify-center text-xs text-slate-400">📁 No attachments yet</div></div>
          </div>
          <footer className="flex flex-wrap gap-2 border-t bg-slate-50 p-4">
            <button onClick={() => { setPostponeDate(''); setPostponeTime(''); setTaskActionDialog('postpone'); }} className="rounded bg-[#063056] px-4 py-2 text-xs font-bold text-white">Postpone</button>
            <button onClick={() => handleToggleComplete(selectedTaskForAction.id)} className="rounded bg-slate-600 px-4 py-2 text-xs font-bold text-white">Mark as Completed</button>
            <button onClick={() => { setFormData({ title: selectedTaskForAction.title, description: selectedTaskForAction.description, assignee: selectedTaskForAction.assignee, taskUnder: selectedTaskForAction.taskUnder, taskType: selectedTaskForAction.taskType, priority: selectedTaskForAction.priority, dueDate: selectedTaskForAction.dueDate, status: selectedTaskForAction.status }); setEditingTaskId(selectedTaskForAction.id); setViewMode('edit-task'); }} className="rounded bg-sky-600 px-4 py-2 text-xs font-bold text-white">Edit</button>
            <button onClick={() => { handleDeleteTask(selectedTaskForAction.id, selectedTaskForAction.title); setViewMode('list'); }} className="rounded bg-rose-600 px-4 py-2 text-xs font-bold text-white">Delete</button>
            <button onClick={() => setViewMode('list')} className="ml-auto rounded border bg-white px-4 py-2 text-xs">← Back</button>
          </footer>
        </section>
      )}
      {viewMode === 'edit-task' && editingTaskId !== null && (
        <section className="overflow-hidden rounded-lg border border-slate-300 bg-white text-xs shadow-sm">
          <header className="flex justify-between border-b bg-slate-100 px-4 py-3 text-sm font-bold"><span>☰ Edit Task</span><button type="button" aria-label="Close edit task" onClick={() => { setViewMode('list'); setEditingTaskId(null); }} className="flex h-7 w-7 items-center justify-center rounded bg-rose-600 text-white hover:bg-rose-700"><X className="h-4 w-4" /></button></header>
          <form onSubmit={(event) => { handleFormSubmit(event); setViewMode('list'); }} className="grid gap-x-4 gap-y-3 p-4 text-xs lg:grid-cols-2">
            <label className="text-xs font-semibold">Assignee<select value={formData.assignee} onChange={(e) => setFormData({ ...formData, assignee: e.target.value })} className="mt-1.5 w-full rounded border p-2">{assigneeOptions.map((name) => <option key={name}>{name}</option>)}</select></label>
            <label className="text-xs font-semibold">Participants<input className="mt-1 w-full rounded border px-2 py-1.5" placeholder="None selected" /></label>
            <label className="text-xs font-semibold">Type<select value={formData.taskType} onChange={(e) => setFormData({ ...formData, taskType: e.target.value })} className="mt-1 w-full rounded border px-2 py-1.5">{['Followup', 'Call', 'Meeting', 'Generic', 'Lead', 'Customer'].map((type) => <option key={type}>{type}</option>)}</select></label>
            <label className="text-xs font-semibold">Priority<select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="mt-1 w-full rounded border px-2 py-1.5">{['Low', 'Medium', 'High'].map((priority) => <option key={priority}>{priority}</option>)}</select></label>
            <label className="text-xs font-semibold">Task Details<textarea value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1 w-full rounded border px-2 py-1.5" rows={2} /></label>
            <label className="text-xs font-semibold">Status<select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="mt-1 w-full rounded border px-2 py-1.5">{['Pending', 'Progress', 'Completed', 'Overdue', 'Upcoming'].map((status) => <option key={status}>{status}</option>)}</select></label>
            <label className="text-xs font-semibold">Description<textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 w-full rounded border px-2 py-1.5" rows={2} /></label>
            <label className="text-xs font-semibold">Task Under<input value={formData.taskUnder} onChange={(e) => setFormData({ ...formData, taskUnder: e.target.value })} className="mt-1 w-full rounded border px-2 py-1.5" /></label>
            <label className="text-xs font-semibold">Due Date<input value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="mt-1 w-full rounded border px-2 py-1.5" /></label>
            <div className="flex justify-end gap-2 border-t pt-4 lg:col-span-2"><button type="button" onClick={() => { setViewMode('list'); setEditingTaskId(null); }} className="rounded border px-4 py-2">Close</button><button className="rounded bg-[#063056] px-5 py-2 font-bold text-white">Update</button></div>
          </form>
        </section>
      )}
      {taskActionDialog && selectedTaskForAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <form onSubmit={(event) => { event.preventDefault(); if (taskActionDialog === 'postpone') { const due = postponeDate ? new Date(postponeDate + 'T' + (postponeTime || '09:00')) : new Date(selectedTaskForAction.dueDate); const nextDue = Number.isNaN(due.getTime()) ? new Date() : due; if (!postponeDate) nextDue.setDate(nextDue.getDate() + 1); setTaskList((prev) => prev.map((task) => task.id === selectedTaskForAction.id ? { ...task, dueDate: nextDue.toLocaleString() } : task)); } else { const dateTime = statusDueDate ? new Date(statusDueDate + 'T' + (statusDueTime || '09:00')).toLocaleString() : selectedTaskForAction.dueDate; setTaskList((prev) => prev.map((task) => task.id === selectedTaskForAction.id ? { ...task, status: statusDraft, completed: statusDraft === 'Completed', dueDate: dateTime, priority: statusPriority, comments: statusComments, note: statusAddNote ? statusComments : task.note } : task)); } setTaskActionDialog(null); toast.success(taskActionDialog === 'postpone' ? 'Task rescheduled' : 'Task status updated'); }} className="w-full max-w-lg rounded-lg bg-white text-sm shadow-2xl max-h-[90vh] overflow-y-auto">
            <header className="border-b px-6 py-4 text-lg font-bold">{taskActionDialog === 'postpone' ? 'Postpone Task' : 'Change Task Status'}</header>
            <div className="space-y-3 p-5 text-xs">
              {taskActionDialog === 'postpone' ? <><label className="flex items-center justify-between gap-4">Due Date *<input type="date" required value={postponeDate} onChange={(e) => setPostponeDate(e.target.value)} className="rounded border p-2" /></label><label className="flex items-center justify-between gap-4">Time<input type="time" value={postponeTime} onChange={(e) => setPostponeTime(e.target.value)} className="rounded border p-2" /></label></> : <>
                <div className="grid grid-cols-[130px_1fr] items-center gap-3"><span>Status</span><div className="flex flex-wrap gap-2">{['Pending', 'Progress', 'Completed'].map((status) => <button key={status} type="button" onClick={() => setStatusDraft(status)} className={'rounded border px-4 py-2 ' + (statusDraft === status ? status === 'Completed' ? 'border-emerald-500 bg-emerald-500 text-white' : status === 'Pending' ? 'border-amber-500 bg-amber-500 text-white' : 'border-blue-500 bg-blue-500 text-white' : 'border-slate-200 bg-slate-100 text-slate-700')}>{status}</button>)}</div></div>
                <div className="grid grid-cols-[130px_1fr] items-center gap-3"><span>Due Date</span><div className="flex gap-2"><input type="date" value={statusDueDate} onChange={(e) => setStatusDueDate(e.target.value)} className="min-w-0 flex-1 rounded border p-2" /><input type="time" value={statusDueTime} onChange={(e) => setStatusDueTime(e.target.value)} className="w-36 rounded border p-2" /></div></div>
                <div className="grid grid-cols-[130px_1fr] items-center gap-3"><span>Priority</span><div className="flex gap-2">{['Low', 'Medium', 'High'].map((priority) => <button key={priority} type="button" onClick={() => setStatusPriority(priority)} className={'rounded border px-4 py-2 ' + (statusPriority === priority ? priority === 'Medium' ? 'border-amber-500 bg-amber-500 text-white' : 'border-blue-500 bg-blue-500 text-white' : 'border-slate-200 bg-slate-100 text-slate-700')}>{priority === 'Medium' ? 'Mid' : priority}</button>)}</div></div>
              </>}
              <label className="grid grid-cols-[130px_1fr] items-start gap-3">Comments<textarea value={taskActionDialog === 'status' ? statusComments : undefined} onChange={taskActionDialog === 'status' ? (e) => setStatusComments(e.target.value) : undefined} className="w-full rounded border p-2" rows={2} /></label>
              {taskActionDialog === 'status' && <label className="grid grid-cols-[130px_1fr] items-center gap-3">Add Note<input type="checkbox" checked={statusAddNote} onChange={(e) => setStatusAddNote(e.target.checked)} className="h-4 w-4" /></label>}
            </div>
            <footer className="flex justify-end gap-2 border-t p-4"><button type="button" onClick={() => setTaskActionDialog(null)} className="rounded border px-4 py-2">Close</button><button className="rounded bg-[#063056] px-5 py-2 font-bold text-white">Update</button></footer>
          </form>
        </div>
      )}
      {/* ================= MODAL: CREATE OR ASSIGN TASK ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#011635]" />
                <h3 className="font-extrabold text-base text-slate-900">
                  {editingTaskId !== null ? 'Edit Commercial Task' : modalMode === 'assign' ? 'Assign Task to Team Member' : 'Create Commercial Task'}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Follow up on Q4 Industrial Tender quotation..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Description / Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Specify action steps, customer contacts or requirements..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assignee *
                  </label>
                  <select
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                  >
                    {assigneeOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Task Under (Lead or Client)
                  </label>
                  <select
                    value={formData.taskUnder}
                    onChange={(e) => setFormData({ ...formData, taskUnder: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                  >
                    {taskUnderOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Task Type
                  </label>
                  <select
                    value={formData.taskType}
                    onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                  >
                    <option value="Followup">Followup</option>
                    <option value="Call">Call</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="text"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold bg-[#011635] text-white hover:bg-[#07244a] shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{editingTaskId !== null ? 'Save Changes' : modalMode === 'assign' ? 'Assign Task' : 'Create Task'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TIER 3: ASSIGN TASK VIEW (Exact Match to Image 3) ================= */}
      {viewMode === 'assign' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-6">
          {/* Top Filter Criteria Grid (Matching Image 3) */}
          <div className="space-y-4">
            {/* Row 1: Sort By | Assignee | Task Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Sort By
                </label>
                <select
                  value={assignSortBy}
                  onChange={(e) => setAssignSortBy(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 font-medium cursor-pointer"
                >
                  <option value="All Task">All Task</option>
                  <option value="High Priority">High Priority</option>
                  <option value="Medium Priority">Medium Priority</option>
                  <option value="Low Priority">Low Priority</option>
                  <option value="Due Date Ascending">Due Date Ascending</option>
                  <option value="Due Date Descending">Due Date Descending</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Assignee
                </label>
                <select
                  value={assignAssignee}
                  onChange={(e) => setAssignAssignee(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 font-medium cursor-pointer"
                >
                  <option value="All Owners">All Owners</option>
                  {assigneeOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Task Type
                </label>
                <select
                  value={assignTaskType}
                  onChange={(e) => setAssignTaskType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 font-medium cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Followup">Followup</option>
                  <option value="Call">Call</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Generic Task">Generic Task</option>
                  <option value="Lead Task">Lead Task</option>
                  <option value="Customer Task">Customer Task</option>
                  <option value="Opportunity Task">Opportunity Task</option>
                  <option value="Contact Task">Contact Task</option>
                  <option value="Campaign Task">Campaign Task</option>
                  <option value="Invoice Task">Invoice Task</option>
                </select>
              </div>
            </div>

            {/* Row 2: Created By | Task Status | Task Due */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Created By
                </label>
                <select
                  value={assignCreatedBy}
                  onChange={(e) => setAssignCreatedBy(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 font-medium cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Sales Manager">Sales Manager</option>
                  <option value="Team Lead">Team Lead</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Task Status
                </label>
                <select
                  value={assignTaskStatus}
                  onChange={(e) => setAssignTaskStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 font-medium cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Task Due
                </label>
                <input
                  type="text"
                  placeholder="dd-mm-yyyy"
                  value={assignTaskDue}
                  onChange={(e) => setAssignTaskDue(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Load Button (Right-aligned matching Image 3) */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleLoadAssignTasks}
                className="px-5 py-2 bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Load</span>
              </button>
            </div>
          </div>

          {/* Sub Controls: Rows Selector & Search Task */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <span>Shows</span>
              <select
                value={assignRowsPerPage}
                onChange={(e) => {
                  setAssignRowsPerPage(Number(e.target.value));
                  setAssignCurrentPage(1);
                }}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>Rows</span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={assignSearchQuery}
                onChange={(e) => {
                  setAssignSearchQuery(e.target.value);
                  setAssignCurrentPage(1);
                }}
                placeholder="Search Task"
                className="pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 w-44 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Table (Matching Image 3) */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full min-w-[900px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-3">SL.NO</th>
                  <th className="py-3 px-3">ASSIGNEE</th>
                  <th className="py-3 px-3">TASK DETAILS</th>
                  <th className="py-3 px-3">TASK UNDER</th>
                  <th className="py-3 px-3">TASK TYPE</th>
                  <th className="py-3 px-3">DUE DATE</th>
                  <th className="py-3 px-3">PRIORITY</th>
                  <th className="py-3 px-3">STATUS</th>
                  <th className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <input
                        type="checkbox"
                        checked={allPagedSelected}
                        onChange={handleToggleSelectAll}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#011635] focus:ring-[#011635] cursor-pointer"
                      />
                      <span>SELECT ALL</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pagedAssignTasks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center text-xs text-slate-400 font-medium">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  pagedAssignTasks.map((task, idx) => {
                    const isSelected = selectedTaskIds.includes(task.id);
                    const slNo = String((assignCurrentPage - 1) * assignRowsPerPage + idx + 1).padStart(2, '0');
                    const initials = task.assignee
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2);

                    return (
                      <tr
                        key={task.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500 font-semibold">
                          {slNo}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                task.avatarBg || 'bg-[#011635] text-white'
                              }`}
                            >
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 leading-tight">
                                {task.assignee}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {task.assigneeRole || 'Sales Executive'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-bold text-slate-900 truncate">
                            {task.title}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            {task.description}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                          {task.taskUnder}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border border-amber-200 bg-amber-50 text-amber-800">
                            {task.taskType}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                          {task.dueDate}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              task.priority === 'High'
                                ? 'border-rose-200 bg-rose-50 text-rose-700'
                                : task.priority === 'Medium'
                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              task.status === 'Completed' || task.completed
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : task.status === 'Overdue'
                                ? 'border-rose-200 bg-rose-50 text-rose-700'
                                : task.status === 'Progress'
                                ? 'border-blue-200 bg-blue-50 text-blue-700'
                                : 'border-slate-200 bg-slate-50 text-slate-700'
                            }`}
                          >
                            {task.completed ? 'Completed' : task.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleTaskSelection(task.id)}
                            className="w-4 h-4 rounded border-slate-300 text-[#011635] focus:ring-[#011635] cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-1">
            <div>
              Showing {pagedAssignTasks.length === 0 ? 0 : (assignCurrentPage - 1) * assignRowsPerPage + 1} to{' '}
              {Math.min(assignCurrentPage * assignRowsPerPage, filteredAssignTasks.length)} of{' '}
              {filteredAssignTasks.length} entries
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAssignCurrentPage((p) => Math.max(1, p - 1))}
                disabled={assignCurrentPage <= 1}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
              >
                «
              </button>
              {Array.from({ length: totalAssignPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setAssignCurrentPage(pg)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    assignCurrentPage === pg
                      ? 'bg-[#0055D4] text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pg}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAssignCurrentPage((p) => Math.min(totalAssignPages, p + 1))}
                disabled={assignCurrentPage >= totalAssignPages}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
              >
                »
              </button>
            </div>
          </div>

          {/* Bottom Action Row (Assign To * [ Select v ] and Assign / Back buttons matching Image 3) */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: Assign To * */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                Assign To <span className="text-rose-500">*</span>
              </label>
              <select
                value={bulkAssignee}
                onChange={(e) => setBulkAssignee(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 font-medium min-w-[200px] cursor-pointer"
              >
                <option value="">Select</option>
                {assigneeOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Right: [Assign] and [<- Back] Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleExecuteAssign}
                className="px-4.5 py-2 bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <SquareArrowOutUpRight className="w-3.5 h-3.5" />
                <span>Assign</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TIER 4: ADD TASK INLINE VIEW (Exact Match to Image 2: "ADD GENERIC TASK") */}
      {/* ============================================================== */}
      {viewMode === 'add-task' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Top Header matching Image 2: ≡ ADD GENERIC TASK | [X] */}
          <div className="px-4 py-3 bg-[#f1f5f9] border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
              <Menu className="w-4 h-4 text-slate-700" />
              <span>{`ADD ${activeAddTaskType.toUpperCase()}`}</span>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="w-5.5 h-5.5 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer transition shadow-2xs"
              title="Close"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Form Body matching Image 2 */}
          <form onSubmit={handleInlineTaskSubmit} className="p-6 space-y-6">
            {/* Row 1: Template * [Select Template ▾] [+ New] */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <label className="text-xs font-semibold text-slate-700 sm:w-28 shrink-0">
                Template <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <select
                    value={selectedTemplate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedTemplate(val);
                      if (val) {
                        setInlineTaskTitle(`${activeAddTaskType}: ${val}`);
                        setInlineTaskDesc(`Execute scheduled ${val.toLowerCase()} per commercial operational workflow.`);
                      } else {
                        setInlineTaskTitle('');
                        setInlineTaskDesc('');
                      }
                    }}
                    className="w-full px-3 py-1.5 pr-8 bg-white border border-slate-300 rounded text-xs text-slate-800 outline-none focus:border-[#011635] cursor-pointer"
                  >
                    <option value="">Select Template</option>
                    {templateOptions.map((tpl) => (
                      <option key={tpl} value={tpl}>
                        {tpl}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddTemplateModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#063056] hover:bg-[#083E6E] text-white text-xs font-bold rounded flex items-center gap-1 cursor-pointer transition whitespace-nowrap"
                >
                  + New
                </button>
              </div>
            </div>

            {/* Optional details visible when template chosen */}
            {selectedTemplate && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4 max-w-2xl animate-in fade-in duration-150">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-200">
                  <span>Task Parameters ({selectedTemplate})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Task Title
                    </label>
                    <input
                      type="text"
                      value={inlineTaskTitle}
                      onChange={(e) => setInlineTaskTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 outline-none focus:border-[#011635]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Assignee
                    </label>
                    <select
                      value={inlineAssignee}
                      onChange={(e) => setInlineAssignee(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 outline-none focus:border-[#011635] cursor-pointer"
                    >
                      {assigneeOptions.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Task Under (Lead/Customer)
                    </label>
                    <select
                      value={inlineTaskUnder}
                      onChange={(e) => setInlineTaskUnder(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 outline-none focus:border-[#011635] cursor-pointer"
                    >
                      {taskUnderOptions.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Priority
                    </label>
                    <select
                      value={inlinePriority}
                      onChange={(e) => setInlinePriority(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 outline-none focus:border-[#011635] cursor-pointer"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Instructions / Description
                  </label>
                  <textarea
                    rows={2}
                    value={inlineTaskDesc}
                    onChange={(e) => setInlineTaskDesc(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 outline-none focus:border-[#011635] resize-none"
                  />
                </div>
              </div>
            )}

            {/* Bottom Action Buttons matching Image 2: [Close] [Submit] */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition shadow-2xs"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded bg-[#063056] hover:bg-[#083E6E] text-white text-xs font-bold cursor-pointer transition shadow-xs"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal for + New Template */}
      {isAddTemplateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h4 className="font-bold text-xs text-slate-900">Add New Task Template</h4>
              <button
                type="button"
                onClick={() => setIsAddTemplateModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewTemplateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Site Survey & Inspection"
                  value={newTemplateInput}
                  onChange={(e) => setNewTemplateInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTemplateModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#063056] text-white font-bold hover:bg-[#083E6E] cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


