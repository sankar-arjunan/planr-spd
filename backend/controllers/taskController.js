const express = require('express');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();
const cron = require('node-cron');
const nodemailer = require('nodemailer');

cron.schedule('* * * * *', async () => {
  const currentTime = new Date();

  try {
    const updatedTasks = await Task.updateMany(
      { time: { $lte: currentTime }, completionType: { $ne: 'completed' } },
      { completionType: 'timeup' }
    );

    console.log(`Updated ${updatedTasks.nModified} tasks to timeup.`);
  } catch (error) {
    console.error('Error updating tasks to timeup:', error);
  }
});

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'planr.psg@gmail.com',
      pass: 'qatgeiyptgmsgpck',
    },
  });

  
  cron.schedule('36 19 * * *', async () => {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

    try {
        const allUsers = await User.find({ notification: 'all' }).select('email');
        const priorityUsers = await User.find({ notification: 'priority' }).select('email');

        const tasks = await Task.find({
            time: { $gte: startOfDay, $lte: endOfDay },
            completionType: 'live'
        });

        const userTasks = tasks.reduce((acc, task) => {
            if (!acc[task.user]) {
                acc[task.user] = [];
            }
            acc[task.user].push({
                taskName: task.taskName,
                time: task.time,
                category: task.category,
            });
            return acc;
        }, {});

        // Send emails to users with "all" notification
        for (const user of allUsers) {
            const userEmail = user.email;
            const tasksForUser = userTasks[userEmail] || [];

            // Fetch suggested task for the user
            let suggestedTask = await Task.findOne({
                user: userEmail,
                completionType: 'timeup',
                hasFlexibleTime: true,
                time: { $lt: startOfDay }
            }).sort({ time: -1 });

            if (!suggestedTask) {
                suggestedTask = await Task.findOne({
                    user: userEmail,
                    completionType: 'live',
                    time: { $gte: startOfDay, $lt: endOfDay }
                });
            }

            if (!suggestedTask) {
                suggestedTask = await Task.findOne({
                    user: userEmail,
                    time: { $gt: endOfDay }
                }).sort({ time: 1 });
            }

            const suggestedTaskHtml = suggestedTask 
                ? `
                    <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f0f8ff;">
                        <h2 style="color: #4CAF50; font-size: 24px; margin: 0;">Suggested Task for Today</h2>
                        <p style="font-size: 18px;"><strong>Task:</strong> ${suggestedTask.taskName}</p>
                        <p style="font-size: 18px;"><strong>Time:</strong> <em>Flexible Timing</em></p>
                        <p style="font-size: 18px;"><strong>Category:</strong> ${suggestedTask.category}</p>
                    </div>
                `
                : '';

            const taskListHtml = tasksForUser.length > 0 
                ? tasksForUser.map(task => 
                    `<li style="margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #e0e0e0;">
                        <strong>Task:</strong> ${task.taskName}<br>
                        <strong>Time:</strong> ${task.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br>
                        <strong>Category:</strong> ${task.category}
                    </li>`
                ).join('') 
                : `<li>No live tasks for today.</li>`;

            const mailOptions = {
                from: 'planr-daily@gmail.com',
                to: userEmail,
                subject: 'Your Tasks for Today',
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.5; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #4CAF50; text-align: center; font-size: 28px;">Your Tasks for Today</h2>
                        ${suggestedTaskHtml}
                        <h3 style="font-size: 24px;">Today's Tasks</h3>
                        <ul style="list-style-type: none; padding: 0;">
                            ${taskListHtml}
                        </ul>
                        <a href="http://localhost:3000/Live" style="display: block; margin: 20px auto; width: 200px; padding: 10px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px; text-align: center;">
                            View All Live Tasks
                        </a>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${userEmail}`);
        }

        // Send suggested tasks to users with "priority" notification
        for (const user of priorityUsers) {
            const userEmail = user.email;

            let suggestedTask = await Task.findOne({
                user: userEmail,
                completionType: 'timeup',
                hasFlexibleTime: true,
                time: { $lt: startOfDay }
            }).sort({ time: -1 });

            if (!suggestedTask) {
                suggestedTask = await Task.findOne({
                    user: userEmail,
                    completionType: 'live',
                    time: { $gte: startOfDay, $lt: endOfDay }
                });
            }

            if (!suggestedTask) {
                suggestedTask = await Task.findOne({
                    user: userEmail,
                    time: { $gt: endOfDay }
                }).sort({ time: 1 });
            }

            if (suggestedTask) {
                const mailOptions = {
                    from: 'planr-daily@gmail.com',
                    to: userEmail,
                    subject: 'Your Suggested Task',
                    html: `
                        <div style="font-family: Arial, sans-serif; line-height: 1.5; padding: 20px; border-radius: 8px; background-color: #f9f9f9;">
                            <h2 style="color: #4CAF50;">Suggested Task for You</h2>
                            <p style="font-size: 18px;"><strong>Task:</strong> ${suggestedTask.taskName}</p>
                            <p style="font-size: 18px;"><strong>Time:</strong> <em>Flexible Timing</em></p>
                            <p style="font-size: 18px;"><strong>Category:</strong> ${suggestedTask.category}</p>
                            <a href="http://localhost:3000/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;">
                                Visit Homepage
                            </a>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log(`Suggested task email sent to ${userEmail}`);
            } else {
                console.log(`No suggested task for priority user ${userEmail}`);
            }
        }
    } catch (error) {
        console.error('Error sending daily tasks email:', error);
    }
});




router.post('/', authMiddleware, async (req, res) => {
  const { taskName, category, time, hasFlexibleTime} = req.body;
  const user = req.user.email;
  const completionType = new Date(time) > new Date() ? 'live' : 'timeup';
  const cat = category.toLowerCase();

  try {
    const currentTime = new Date();
    if (time <= currentTime) {
      return res.status(400).json({ message: 'Cannot create task; time is not in the future.' });
    }
    const task = new Task({
      taskName,
      time,
      category : cat,
      completionType,
      user,
      hasFlexibleTime
    });

    await task.save();
    res.status(201).json({ message: 'Task created successfully!', task });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating task.', error });
  }
});


router.get('/', authMiddleware, async (req, res) => {
  const user = req.user.email;
  const { search } = req.query;

  try {
    const currentTime = new Date();

    const query = { user };
    if (search && search.trim() !== '') {
      query.taskName = { $regex: search, $options: 'i' };
    }

    console.log(query);

    const tasks = await Task.find(query);
    tasks.sort((a, b) => {
        const timeA = new Date(a.time);
        const timeB = new Date(b.time);
  
        
        if (timeA > currentTime && timeB > currentTime) {
          return timeA - timeB;
        }
  
        
        if (timeA < currentTime && timeB < currentTime) {
          return timeB - timeA;
        }
  
        
        return timeA > currentTime ? -1 : 1;
      });
  
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tasks.', error });
  }
});

router.get('/categories', authMiddleware, async (req, res) => {
    const user = req.user.email;
  
    try {

      const categories = await Task.distinct('category', { user, completionType:"live" });
      const uniqueCategories = Array.from(new Set(categories.map(cat => cat.toLowerCase())));

      res.status(200).json(uniqueCategories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching categories.', error });
    }
  });

  

router.get('/id/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const user = req.user.email;

  try {
    const task = await Task.findOne({ taskId: id, user });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or you do not have permission to access this task.' });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching task.', error });
  }
});


router.put('/id/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const user = req.user.email;
    console.log(user+"  "+id);
    req.body.category = req.body.category.toLowerCase();
    const taskTime = new Date(req.body.time).getTime();
    const completionType = taskTime > Date.now() ? "live" : "timeup";
    
    console.log(completionType, taskTime, Date.now());
  try {
    const currentTime = new Date();
    if (req.body.time){
      if(req.body.time <= currentTime) {
        return res.status(400).json({ message: 'Cannot update task; time is not in the future.' });
      }
    } 
    const task = await Task.findOneAndUpdate(
        { taskId: id, user },
        { ...req.body, completionType },
        { new: true, runValidators: true }
      );
    if (!task) {
      return res.status(404).json({ message: 'Task not found or you do not have permission to update this task.' });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error updating task.', error });
  }
});


router.delete('/id/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const user = req.user.email;

  try {
    const task = await Task.findOneAndDelete({ taskId: id, user });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or you do not have permission to delete this task.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting task.', error });
  }
});

router.get('/category/:category', authMiddleware, async (req, res) => {
  const { category } = req.params;
  const user = req.user.email;
  const { search } = req.query;

  try {
    const currentTime = new Date();

    const query = { user, category,completionType: 'live' };
    if (search && search.trim() !== '') {
      query.taskName = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(query);
    tasks.sort((a, b) => {
        const timeA = new Date(a.time);
        const timeB = new Date(b.time);
  
        if (timeA > currentTime && timeB > currentTime) {
          return timeA - timeB;
        }
  
        if (timeA < currentTime && timeB < currentTime) {
          return timeB - timeA;
        }
  
        return timeA > currentTime ? -1 : 1;
      });
  
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tasks by category.', error });
  }
});

router.get('/today', authMiddleware, async (req, res) => {
    const user = req.user.email;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const { search } = req.query;
  
    try {
        const currentTime = new Date();
        const query = {
            user,
            time: { $gte: startOfDay, $lte: endOfDay },
            completionType: 'live'
          };
    if (search && search.trim() !== '') {
      query.taskName = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

      const tasks = await Task.find(query);
      tasks.sort((a, b) => {
        const timeA = new Date(a.time);
        const timeB = new Date(b.time);
  
        // Check if both are in the future
        if (timeA > currentTime && timeB > currentTime) {
          return timeA - timeB; // Sort ascending for future tasks
        }
  
        // Check if both are in the past
        if (timeA < currentTime && timeB < currentTime) {
          return timeB - timeA; // Sort descending for past tasks
        }
  
        // If one is in the future and one is in the past, future comes first
        return timeA > currentTime ? -1 : 1;
      });
  
      res.status(200).json(tasks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching tasks for today.', error });
    }
  });
  
  router.get('/timeup', authMiddleware, async (req, res) => {
    const user = req.user.email;
    console.log(user);
    const { search } = req.query;
    try {
        const currentTime = new Date();
        const query = { user, completionType: 'timeup' };
    if (search&& search.trim() !== '') {
      query.taskName = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

      const tasks = await Task.find(query);
      tasks.sort((a, b) => {
        const timeA = new Date(a.time);
        const timeB = new Date(b.time);
  
        // Check if both are in the future
        if (timeA > currentTime && timeB > currentTime) {
          return timeA - timeB; // Sort ascending for future tasks
        }
  
        // Check if both are in the past
        if (timeA < currentTime && timeB < currentTime) {
          return timeB - timeA; // Sort descending for past tasks
        }
  
        // If one is in the future and one is in the past, future comes first
        return timeA > currentTime ? -1 : 1;
      });
  
      res.status(200).json(tasks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching timeup tasks.', error });
    }
  });
  
  router.get('/live', authMiddleware, async (req, res) => {
    const user = req.user.email;
    const { search } = req.query;
  
    try {
        const currentTime = new Date();
        const query = { user, completionType: 'live' };
    if (search && search.trim() !== '') {
      query.taskName = { $regex: search, $options: 'i' }; // Case-insensitive search
    }
        console.log(user);
      const tasks = await Task.find(query);
      tasks.sort((a, b) => {
        const timeA = new Date(a.time);
        const timeB = new Date(b.time);
  
        // Check if both are in the future
        if (timeA > currentTime && timeB > currentTime) {
          return timeA - timeB; // Sort ascending for future tasks
        }
  
        // Check if both are in the past
        if (timeA < currentTime && timeB < currentTime) {
          return timeB - timeA; // Sort descending for past tasks
        }
  
        // If one is in the future and one is in the past, future comes first
        return timeA > currentTime ? -1 : 1;
      });
  
      res.status(200).json(tasks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching live tasks.', error });
    }
  });
  
  router.get('/completed', authMiddleware, async (req, res) => {
    const user = req.user.email;
    const { search } = req.query;
    console.log(user);
  
    try {
        const query = { user, completionType: 'completed' };
        if (search && search.trim() !== '') {
          query.taskName = { $regex: search, $options: 'i' }; // Case-insensitive search
        }
      const tasks = await Task.find(query);
      res.status(200).json(tasks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching completed tasks.', error });
    }
  });

router.post('/completed/:taskId', authMiddleware, async (req, res) => {
    const { taskId } = req.params;
    const user = req.user.email;
  
    try {
      const task = await Task.findOne({ taskId: taskId, user });
  
      if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
      }
  
      if (task.completionType === 'live') {
        task.completionType = 'completed';
        await task.save();
        res.status(200).json({ message: 'Task marked as completed.', task });
      } else {
        res.status(400).json({ message: 'Task is not currently live.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error marking task as completed.', error });
    }
  });
  
router.post('/live/:taskId', authMiddleware, async (req, res) => {
    const { taskId } = req.params;
    const user = req.user.email;
  
    try {
        const currentTime = new Date();
      const task = await Task.findOne({ taskId: taskId, user });
  
      if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
      }
  
      if (task.completionType === 'completed') {
        const currentTime = new Date();
        if (task.time > currentTime) {
          task.completionType = 'live';
          await task.save();
          res.status(200).json({ message: 'Task marked as live.', task });
        } else {
          return res.status(400).json({ message: 'Cannot set task to live; time is not in the future.' });
        }
      } else if (task.completionType === 'live') {
        return res.status(400).json({ message: 'Task is already live.' });
      } else {
        return res.status(400).json({ message: 'Task is not completed.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error marking task as live.', error });
    }
  });
  

  router.get('/stats', authMiddleware, async (req, res) => {
    const user = req.user.email;
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
    const endOfWeek = new Date(currentDate.setDate(startOfWeek.getDate() + 6));
  
    try {
        // Total tasks and completed tasks
        const totalTasks = await Task.countDocuments({ user ,  completionType: { $in: ['completed', 'timeup'] }});
        const completedTasks = await Task.countDocuments({ user, completionType: 'completed' });
  
        // Task completion rate
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
        // Tasks completed this week
        const tasksThisWeek = await Task.countDocuments({
            user,
            completionType: 'completed',
            updatedAt: { $gte: startOfWeek, $lt: endOfWeek }
        });
  
        // Tasks completed last week
        const lastWeekStart = new Date(startOfWeek);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(endOfWeek);
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
  
        const tasksLastWeek = await Task.countDocuments({
            user,
            completionType: 'completed',
            updatedAt: { $gte: lastWeekStart, $lt: lastWeekEnd }
        });
  
        // Productivity comparison
        const productivityChange = tasksThisWeek > tasksLastWeek ? 
            ((tasksThisWeek - tasksLastWeek) / tasksLastWeek) * 100 : 
            (tasksLastWeek > 0 ? -((tasksLastWeek - tasksThisWeek) / tasksLastWeek) * 100 : 0);
  
        // Most productive time of day
        const mostProductiveTime = await Task.aggregate([
            { $match: { user, completionType: 'completed' } },
            { $group: { _id: { $hour: "$time" }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
  
        const hourToPeriod = (hour) => {
            if (hour >= 5 && hour < 12) return "Morning";
            if (hour >= 12 && hour < 17) return "Afternoon";
            if (hour >= 17 && hour < 21) return "Evening";
            if (hour >= 21 && hour < 24) return "Night";
            return "Late Night"; // Covers hour 0 to 4
        };
  
        const productiveTime = mostProductiveTime.length > 0 ? hourToPeriod(mostProductiveTime[0]._id) : 'N/A';
  
        // Most productive day of the week
        const mostProductiveDay = await Task.aggregate([
            { $match: { user, completionType: 'completed' } },
            { $group: { _id: { $dayOfWeek: "$time" }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
  
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const productiveDay = mostProductiveDay.length > 0 ? daysOfWeek[mostProductiveDay[0]._id - 1] : 'N/A'; // _id is 1-7
  
        // Most productive task type
        const mostProductiveCategory = await Task.aggregate([
            { $match: { user, completionType: 'completed' } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
  
        const productiveCategory = mostProductiveCategory.length > 0 ? mostProductiveCategory[0]._id : 'N/A';
  
        res.status(200).json({
            completionRate,
            productivityChange,
            productiveTime,
            productiveDay,
            productiveCategory
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching stats.', error });
    }
});
  

router.get('/suggested',authMiddleware, async (req, res) => {
    const userId = req.user.email; // Adjust based on your auth middleware

    try {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        // Find tasks that have timed out but have flexible time
        const suggestedTask = await Task.findOne({
            user: userId,
            completionType: 'timeup',
            hasFlexibleTime: true,
            time: { $lt: startOfDay }
        }).sort({ time: -1 }); // Sort to get the most recent

        if (suggestedTask) {
            return res.status(200).json(suggestedTask);
        }

        // If no suitable task found, look for live tasks for today
        const liveTask = await Task.findOne({
            user: userId,
            completionType: 'live',
            time: { $gte: startOfDay, $lt: endOfDay }
        });

        if (liveTask) {
            return res.status(200).json(liveTask);
        }

        // If no live tasks, look for future tasks
        const futureTask = await Task.findOne({
            user: userId,
            time: { $gt: endOfDay }
        }).sort({ time: 1 }); // Sort to get the earliest future task

        if (futureTask) {
            return res.status(200).json(futureTask);
        }

        return res.status(404).json({ message: "No task available" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint to mark a suggestion as bad
router.post('/suggested-bad',authMiddleware, async (req, res) => {
  const { taskId } = req.body; // Expecting { taskId: '<task_id>' }

  try {
      await Task.updateOne({ taskId: taskId }, { $set: { hasFlexibleTime: false } }); // Update to prevent future suggestions
      res.status(200).json({ message: "Task marked as bad and will not be suggested again." });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to mark a task as completed
router.post('/suggested-completed', authMiddleware, async (req, res) => {
  const { taskId } = req.body; 

  try {
      await Task.updateOne({ taskId: taskId }, { $set: { completionType: 'completed' } });
      res.status(200).json({ message: "Task marked as completed." });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
