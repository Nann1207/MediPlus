import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Bell, Calendar as CalendarIcon, Info, Clock, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// --- AI config: reuse the same model/key as MedBot ---
const AI_ENDPOINT = 'https://api.sea-lion.ai/v1/chat/completions';
// Prefer an env var in real code:
const AI_API_KEY = 'sk-Y8L5mwaeYGh4PSl2xXDbAA';

// System prompt: medication info only, return strict JSON
const MED_INFO_SYSTEM = {
  role: 'system',
  content: `You are MedBot. When asked about a medication, reply ONLY with strict JSON:
{
  "ingredients": "<main active ingredients>",
  "purpose": "<primary uses/conditions>",
  "sideEffects": "<common side effects in plain text, comma separated>",
  "precautions": "<important precautions/warnings in plain text>"
}
No extra text before or after the JSON. No markdown. Keep lines short and readable.`
};

async function fetchMedicationInfoViaAI(medicationName: string): Promise<MedicationInfo> {
  const userMsg = {
    role: 'user',
    content: `Medication: "${medicationName}". Return JSON as specified.`
  };

  const res = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'aisingapore/Llama-SEA-LION-v3-70B-IT',
      temperature: 0.4,
      max_completion_tokens: 220,
      messages: [MED_INFO_SYSTEM, userMsg],
    }),
  });

  if (!res.ok) {
    throw new Error(`AI error ${res.status}`);
  }

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content?.trim() || '';

  // Try parsing strict JSON; if it fails, attempt to salvage
  try {
    const parsed = JSON.parse(raw);
    return {
      ingredients: parsed.ingredients || 'Information not available',
      purpose: parsed.purpose || 'Information not available',
      sideEffects: parsed.sideEffects || 'Information not available',
      precautions: parsed.precautions || 'Information not available',
    };
  } catch {
    // Fallback: very basic extraction if model ever adds extra text
    const grab = (label: string) => {
      const m = new RegExp(`"${label}"\\s*:\\s*"([^"]+)"`, 'i').exec(raw);
      return m?.[1] || 'Information not available';
    };
    return {
      ingredients: grab('ingredients'),
      purpose: grab('purpose'),
      sideEffects: grab('sideEffects'),
      precautions: grab('precautions'),
    };
  }
}


const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  time: z.string().min(1, 'Time is required'),
  notes: z.string().optional(),
});

type MedicationForm = z.infer<typeof medicationSchema>;

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  notes?: string;
  dateAdded: Date;
}

interface MedicationInfo {
  ingredients: string;
  purpose: string;
  sideEffects: string;
  precautions: string;
}

const MedicationTracker = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddingMed, setIsAddingMed] = useState(false);
  const [medicationInfo, setMedicationInfo] = useState<MedicationInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [searchedMed, setSearchedMed] = useState('');

  const form = useForm<MedicationForm>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: '',
      dosage: '',
      frequency: '',
      time: '',
      notes: '',
    },
  });

  useEffect(() => {
    const mustHave: Medication[] = [
      {
        id: "seed-insulin",
        name: "Insulin",
        dosage: "10 units",
        frequency: "twice-daily",
        time: "20:00",
        notes: "Inject subcutaneously before meals",
        dateAdded: new Date(),
      },
      {
        id: "seed-bp",
        name: "Lisinopril (High Blood Pressure)",
        dosage: "10mg",
        frequency: "once-daily",
        time: "09:00",
        notes: "Take with water, same time every day",
        dateAdded: new Date(),
      },
    ];
  
    const saved = localStorage.getItem("medications");
    if (saved) {
      const parsed: Medication[] = JSON.parse(saved).map((m: any) => ({
        ...m,
        dateAdded: new Date(m.dateAdded),
      }));
  
      // merge in seeds if missing (by id OR by name)
      const byId = new Set(parsed.map(m => m.id));
      const byName = new Set(parsed.map(m => m.name.toLowerCase()));
      const missing = mustHave.filter(
        m => !byId.has(m.id) && !byName.has(m.name.toLowerCase())
      );
  
      const merged = missing.length ? [...parsed, ...missing] : parsed;
      setMedications(merged);
      if (missing.length) localStorage.setItem("medications", JSON.stringify(merged));
    } else {
      setMedications(mustHave);
      localStorage.setItem("medications", JSON.stringify(mustHave));
    }
  }, []);
  
  

  const saveMedications = (meds: Medication[]) => {
    localStorage.setItem('medications', JSON.stringify(meds));
    setMedications(meds);
  };

  const onSubmit = (data: MedicationForm) => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      time: data.time,
      notes: data.notes,
      dateAdded: new Date(),
    };
    
    const updatedMeds = [...medications, newMedication];
    saveMedications(updatedMeds);
    
    form.reset();
    setIsAddingMed(false);
    toast({
      title: "Medication Added",
      description: `${data.name} has been added to your medication schedule.`,
    });
  };

  const deleteMedication = (id: string) => {
    const updatedMeds = medications.filter(med => med.id !== id);
    saveMedications(updatedMeds);
    toast({
      title: "Medication Removed",
      description: "Medication has been removed from your schedule.",
    });
  };

  const getMedicationInfo = async (medicationName: string) => {
    setLoadingInfo(true);
    setSearchedMed(medicationName);
    try {
      const info = await fetchMedicationInfoViaAI(medicationName);
      setMedicationInfo(info);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch medication information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingInfo(false);
    }
  };

  const getTodaysMedications = () => {
    if (!selectedDate) return [];
    const today = selectedDate.toDateString();
    return medications.filter(med => {
      // Simple logic - in real app, you'd have more complex scheduling
      return true; // Show all medications for now
    });
  };

  const addToGoogleCalendar = (medication: Medication) => {
    const startTime = new Date();
    const [hours, minutes] = medication.time.split(':');
    startTime.setHours(parseInt(hours), parseInt(minutes));
    
    const endTime = new Date(startTime.getTime() + 15 * 60000); // 15 minutes later
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Take ${medication.name}`)}&dates=${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Dosage: ${medication.dosage}\nFrequency: ${medication.frequency}\nNotes: ${medication.notes || 'No notes'}`)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      
      <div className="container mx-auto px-4 pt-12 pb-12">
        {/* Header */}
        <div className="text-center mb-8">
            <h1 className="text-6xl font-extrabold tracking-tight block bg-gradient-to-r from-primary via-wellness to-secondary bg-clip-text text-transparent">
            Medication Tracker
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your medications, set reminders, and get detailed information about your prescriptions
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Calendar & Add Medication */}
          <div className="space-y-6">
            {/* Calendar */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Medication Calendar
                    </CardTitle>
                </CardHeader>

                {/* tighter padding so the calendar can breathe */}
                <CardContent className="p-4">
                    <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    showOutsideDays
                    fixedWeeks
                    // fill the container
                    className="w-full rounded-lg"
                    // override shadcn calendar sizing so it stretches
                    classNames={{
                        months: "w-full",
                        month: "w-full",
                        table: "w-full",
                        caption: "flex items-center justify-between px-2 pb-3",
                        caption_label: "text-base font-semibold",
                        nav: "flex items-center gap-1",
                        head_row: "grid grid-cols-7",
                        head_cell:
                        "text-muted-foreground font-medium text-xs h-9 flex items-center justify-center",
                        row: "grid grid-cols-7 gap-1",
                        cell: "relative",
                        // days auto-size to the grid cell and stay square
                        day:
                        "w-full aspect-square p-0 rounded-md text-sm " +
                        "hover:bg-accent hover:text-accent-foreground " +
                        "focus:bg-accent focus:text-accent-foreground " +
                        "aria-selected:bg-primary aria-selected:text-primary-foreground",
                        day_selected:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_today: "ring-1 ring-primary",
                    }}
                    // remove the inner border to avoid the double-border look
                    // (you had `className="rounded-md border"` before)
                    />
                </CardContent>
                </Card>


            {/* Add Medication Button */}
            <Dialog open={isAddingMed} onOpenChange={setIsAddingMed}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Medication
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Medication</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medication Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Aspirin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dosage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosage</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 100mg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="How often?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="once-daily">Once daily</SelectItem>
                              <SelectItem value="twice-daily">Twice daily</SelectItem>
                              <SelectItem value="three-times-daily">Three times daily</SelectItem>
                              <SelectItem value="four-times-daily">Four times daily</SelectItem>
                              <SelectItem value="as-needed">As needed</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Any special instructions..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full">
                      Add Medication
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Middle Column - Medication List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Medications</h2>
            
            {medications.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No medications added yet</p>
                </CardContent>
              </Card>
            ) : (
              medications.map((medication) => (
                <Card key={medication.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{medication.name}</h3>
                        <p className="text-sm text-muted-foreground">{medication.dosage}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMedication(medication.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{medication.frequency} at {medication.time}</span>
                      </div>
                      {medication.notes && (
                        <p className="text-muted-foreground">{medication.notes}</p>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToGoogleCalendar(medication)}
                        className="flex-1"
                      >
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        Add to Calendar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => getMedicationInfo(medication.name)}
                        className="flex-1"
                      >
                        <Info className="w-4 h-4 mr-1" />
                        Info
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Right Column - Medication Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Medication Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingInfo ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading information...</p>
                  </div>
                ) : medicationInfo ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold">{searchedMed}</h3>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary">Active Ingredients</h4>
                      <p className="text-sm text-muted-foreground">{medicationInfo.ingredients}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary">Used For</h4>
                      <p className="text-sm text-muted-foreground">{medicationInfo.purpose}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary">Side Effects</h4>
                      <p className="text-sm text-muted-foreground">{medicationInfo.sideEffects}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary">Precautions</h4>
                      <p className="text-sm text-muted-foreground">{medicationInfo.precautions}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Click "Info" on any medication to get detailed information
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getTodaysMedications().length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No medications scheduled for today
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getTodaysMedications().map((med) => (
                      <div key={med.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{med.name}</p>
                          <p className="text-xs text-muted-foreground">{med.dosage}</p>
                        </div>
                        <span className="text-sm font-medium">{med.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationTracker;