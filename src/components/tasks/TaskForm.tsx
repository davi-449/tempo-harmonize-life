
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTask, TaskCategory } from '@/context/TaskContext';
import { toast } from 'sonner';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: {
    id: string;
    title: string;
    description?: string;
    dueDate: Date;
    category: TaskCategory;
    priority: 'low' | 'medium' | 'high';
  };
}

export default function TaskForm({ isOpen, onClose, editTask }: TaskFormProps) {
  const { addTask, updateTask } = useTask();
  const [title, setTitle] = useState(editTask?.title || '');
  const [description, setDescription] = useState(editTask?.description || '');
  const [dueDate, setDueDate] = useState(editTask?.dueDate ? new Date(editTask.dueDate).toISOString().split('T')[0] : '');
  const [category, setCategory] = useState<TaskCategory>(editTask?.category || 'personal');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(editTask?.priority || 'medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !dueDate) {
      toast.error('Title and due date are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        title,
        description,
        dueDate: new Date(dueDate),
        category,
        priority,
        completed: false,
      };

      if (editTask) {
        updateTask(editTask.id, taskData);
        toast.success('Task updated successfully');
      } else {
        addTask(taskData);
        toast.success('Task added successfully');
      }
      
      onClose();
      // Clear form if not editing
      if (!editTask) {
        setTitle('');
        setDescription('');
        setDueDate('');
        setCategory('personal');
        setPriority('medium');
      }
    } catch (error) {
      toast.error('Failed to save task');
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] animate-fade-in">
        <DialogHeader>
          <DialogTitle>{editTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {editTask 
              ? 'Update your task details below.' 
              : 'Fill in the information below to create a new task.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about your task"
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as TaskCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
