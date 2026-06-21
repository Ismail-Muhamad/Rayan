export function mergeReportActivitiesIntoTasks(tasksData, reportsData) {
  const mergedTasks = [...(tasksData || [])];
  
  if (!reportsData || !Array.isArray(reportsData)) return mergedTasks;

  reportsData.forEach(report => {
    const farmId = report.farm_id || report.farmId || (report.farm && report.farm.id);
    const palmTypeId = report.palm_type_id || report.palmTypeId || (report.palm_type && report.palm_type.id);
    
    if (!report.report_weeks || !Array.isArray(report.report_weeks)) return;

    report.report_weeks.forEach(week => {
      if (!week.days || !Array.isArray(week.days)) return;
      
      week.days.forEach(day => {
        const date = day.date ? day.date.split('T')[0] : null;
        if (!date) return;

        // Check Irrigation
        const hasIrrigation = (day.irrigation_amount_per_palm_tree && String(day.irrigation_amount_per_palm_tree) !== '0' && day.irrigation_amount_per_palm_tree !== 'بدون كمية') ||
                              (day.duration_of_irrigation_per_palm_tree && String(day.duration_of_irrigation_per_palm_tree) !== '0' && day.duration_of_irrigation_per_palm_tree !== 'بدون كمية');
                              
        if (hasIrrigation) {
          const existingTaskIndex = mergedTasks.findIndex(t => t.task_type === 'irrigation' && (t.date && t.date.split('T')[0] === date) && String(t.palm_type_id) === String(palmTypeId));
          if (existingTaskIndex === -1) {
            mergedTasks.push({
              id: `rep-irr-${date}-${palmTypeId}`,
              task_type: 'irrigation',
              title: 'ري (إضافي)',
              date: date,
              farm_id: farmId,
              palm_type_id: palmTypeId,
              is_completed: true,
              notes: 'نشاط إضافي مسجل في التقرير',
              quantitative_data: {
                irrigation_amount_per_palm_tree: day.irrigation_amount_per_palm_tree,
                duration_of_irrigation_per_palm_tree: day.duration_of_irrigation_per_palm_tree,
                total_amount_of_irrigation: day.total_amount_of_irrigation
              }
            });
          } else {
            const existingTask = mergedTasks[existingTaskIndex];
            mergedTasks[existingTaskIndex] = {
              ...existingTask,
              is_completed: true,
              notes: 'نشاط إضافي مسجل في التقرير',
              quantitative_data: {
                ...(existingTask.quantitative_data || {}),
                irrigation_amount_per_palm_tree: day.irrigation_amount_per_palm_tree,
                duration_of_irrigation_per_palm_tree: day.duration_of_irrigation_per_palm_tree,
                total_amount_of_irrigation: day.total_amount_of_irrigation
              }
            };
          }
        }

        // Check Spraying
        const hasSpraying = (day.pesticide_type_id && String(day.pesticide_type_id) !== '0' && day.pesticide_type_id !== 'بدون كمية') ||
                            (day.spraying && String(day.spraying) !== '0' && day.spraying !== 'بدون كمية') ||
                            (day.amount_of_spray && String(day.amount_of_spray) !== '0' && day.amount_of_spray !== 'بدون كمية');
                            
        if (hasSpraying) {
          const existingTaskIndex = mergedTasks.findIndex(t => t.task_type === 'spraying' && (t.date && t.date.split('T')[0] === date) && String(t.palm_type_id) === String(palmTypeId));
          if (existingTaskIndex === -1) {
            mergedTasks.push({
              id: `rep-spr-${date}-${palmTypeId}`,
              task_type: 'spraying',
              title: 'رش (إضافي)',
              date: date,
              farm_id: farmId,
              palm_type_id: palmTypeId,
              is_completed: true,
              notes: 'نشاط إضافي مسجل في التقرير',
              quantitative_data: {
                spraying: day.spraying,
                amount_of_spray: day.amount_of_spray,
                total_spray: day.total_spray,
                pesticide_type_id: day.pesticide_type_id
              }
            });
          } else {
            const existingTask = mergedTasks[existingTaskIndex];
            mergedTasks[existingTaskIndex] = {
              ...existingTask,
              is_completed: true,
              notes: 'نشاط إضافي مسجل في التقرير',
              quantitative_data: {
                ...(existingTask.quantitative_data || {}),
                spraying: day.spraying,
                amount_of_spray: day.amount_of_spray,
                total_spray: day.total_spray,
                pesticide_type_id: day.pesticide_type_id
              }
            };
          }
        }

        // Check Fertilization
        if (day.fertilizations && Array.isArray(day.fertilizations)) {
          day.fertilizations.forEach((f, idx) => {
            if (f.type_of_fertilization && f.type_of_fertilization !== '0' && f.type_of_fertilization !== 'بدون كمية') {
              const existingTaskIndex = mergedTasks.findIndex(t => {
                if (t.task_type !== 'fertilization' || !t.date || t.date.split('T')[0] !== date || String(t.palm_type_id) !== String(palmTypeId)) return false;
                
                let qData = t.quantitative_data || {};
                if (typeof qData === 'string') {
                  try { qData = JSON.parse(qData); } catch(e) {}
                }
                return qData.type_of_fertilization === f.type_of_fertilization;
              });

              if (existingTaskIndex === -1) {
                mergedTasks.push({
                  id: `rep-fer-${date}-${palmTypeId}-${idx}`,
                  task_type: 'fertilization',
                  title: 'تسميد (إضافي)',
                  date: date,
                  farm_id: farmId,
                  palm_type_id: palmTypeId,
                  is_completed: true,
                  notes: 'نشاط إضافي مسجل في التقرير',
                  quantitative_data: {
                    type_of_fertilization: f.type_of_fertilization,
                    fertilizer_quantity_per_palm_tree: f.fertilizer_quantity_per_palm_tree,
                    total_fertilization: f.total_fertilization,
                    fertilizer_type_id: f.fertilizer_type_id
                  }
                });
              } else {
                const existingTask = mergedTasks[existingTaskIndex];
                mergedTasks[existingTaskIndex] = {
                  ...existingTask,
                  is_completed: true,
                  notes: 'نشاط إضافي مسجل في التقرير',
                  quantitative_data: {
                    ...(typeof existingTask.quantitative_data === 'string' ? JSON.parse(existingTask.quantitative_data) : existingTask.quantitative_data || {}),
                    type_of_fertilization: f.type_of_fertilization,
                    fertilizer_quantity_per_palm_tree: f.fertilizer_quantity_per_palm_tree,
                    total_fertilization: f.total_fertilization,
                    fertilizer_type_id: f.fertilizer_type_id
                  }
                };
              }
            }
          });
        }

      });
    });
  });

  return mergedTasks;
}
