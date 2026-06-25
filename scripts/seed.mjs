import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', 'data', 'locobiz.db')
const db = createClient({ url: `file:${dbPath}` })

// ── States & Districts ──────────────────────────────────────────────
const statesData = [
  { slug: 'andhra-pradesh', name: 'Andhra Pradesh', type: 'state', districts: ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 'Kurnool', 'Prakasam', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'] },
  { slug: 'arunachal-pradesh', name: 'Arunachal Pradesh', type: 'state', districts: ['Tawang', 'West Kameng', 'East Kameng', 'Papum Pare', 'Kurung Kumey', 'Kra Daadi', 'Lower Subansiri', 'Upper Subansiri', 'West Siang', 'East Siang', 'Siang', 'Upper Siang', 'Lower Siang', 'Lower Dibang Valley', 'Dibang Valley', 'Anjaw', 'Lohit', 'Namsai', 'Changlang', 'Tirap', 'Longding'] },
  { slug: 'assam', name: 'Assam', type: 'state', districts: ['Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong', 'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur', 'South Salmara Mankachar', 'Tinsukia', 'Udalguri', 'West Karbi Anglong'] },
  { slug: 'bihar', name: 'Bihar', type: 'state', districts: ['Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar', 'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur', 'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur', 'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali', 'West Champaran'] },
  { slug: 'chhattisgarh', name: 'Chhattisgarh', type: 'state', districts: ['Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur', 'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg', 'Gariaband', 'Gaurela Pendra Marwahi', 'Janjgir Champa', 'Jashpur', 'Kabirdham', 'Kanker', 'Kondagaon', 'Korba', 'Koriya', 'Mahasamund', 'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Sukma', 'Surajpur', 'Surguja'] },
  { slug: 'goa', name: 'Goa', type: 'state', districts: ['North Goa', 'South Goa'] },
  { slug: 'gujarat', name: 'Gujarat', type: 'state', districts: ['Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'] },
  { slug: 'haryana', name: 'Haryana', type: 'state', districts: ['Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'] },
  { slug: 'himachal-pradesh', name: 'Himachal Pradesh', type: 'state', districts: ['Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'] },
  { slug: 'jharkhand', name: 'Jharkhand', type: 'state', districts: ['Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Garhwa', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar', 'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahibganj', 'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'] },
  { slug: 'karnataka', name: 'Karnataka', type: 'state', districts: ['Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davangere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'] },
  { slug: 'kerala', name: 'Kerala', type: 'state', districts: ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'] },
  { slug: 'madhya-pradesh', name: 'Madhya Pradesh', type: 'state', districts: ['Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad', 'Indore', 'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Mandla', 'Mandsaur', 'Morena', 'Narsinghpur', 'Neemuch', 'Niwari', 'Panna', 'Raisen', 'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'] },
  { slug: 'maharashtra', name: 'Maharashtra', type: 'state', districts: ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'] },
  { slug: 'manipur', name: 'Manipur', type: 'state', districts: ['Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 'Pherzawl', 'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'] },
  { slug: 'meghalaya', name: 'Meghalaya', type: 'state', districts: ['East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills', 'North Garo Hills', 'Ri Bhoi', 'South Garo Hills', 'South West Garo Hills', 'South West Khasi Hills', 'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills'] },
  { slug: 'mizoram', name: 'Mizoram', type: 'state', districts: ['Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Saitual', 'Serchhip', 'Siaha'] },
  { slug: 'nagaland', name: 'Nagaland', type: 'state', districts: ['Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 'Noklak', 'Peren', 'Phek', 'Tuensang', 'Wokha', 'Zunheboto'] },
  { slug: 'odisha', name: 'Odisha', type: 'state', districts: ['Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur', 'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha', 'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'] },
  { slug: 'punjab', name: 'Punjab', type: 'state', districts: ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Mohali', 'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'Shaheed Bhagat Singh Nagar', 'Sri Muktsar Sahib', 'Tarn Taran'] },
  { slug: 'rajasthan', name: 'Rajasthan', type: 'state', districts: ['Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Hanumangarh', 'Jaipur', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Kota', 'Nagaur', 'Pali', 'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'] },
  { slug: 'sikkim', name: 'Sikkim', type: 'state', districts: ['Gangtok', 'Gyalshing', 'Mangan', 'Namchi', 'Pakyong', 'Soreng'] },
  { slug: 'tamil-nadu', name: 'Tamil Nadu', type: 'state', districts: ['Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupattur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'] },
  { slug: 'telangana', name: 'Telangana', type: 'state', districts: ['Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Komaram Bheem Asifabad', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Ranga Reddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal Rural', 'Warangal Urban', 'Yadadri Bhuvanagiri'] },
  { slug: 'tripura', name: 'Tripura', type: 'state', districts: ['Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'] },
  { slug: 'uttar-pradesh', name: 'Uttar Pradesh', type: 'state', districts: ['Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya', 'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddh Nagar', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kushinagar', 'Lakhimpur Kheri', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Prayagraj', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'] },
  { slug: 'uttarakhand', name: 'Uttarakhand', type: 'state', districts: ['Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'] },
  { slug: 'west-bengal', name: 'West Bengal', type: 'state', districts: ['Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'] },
  { slug: 'andaman-and-nicobar', name: 'Andaman and Nicobar Islands', type: 'ut', districts: ['North and Middle Andaman', 'South Andaman', 'Nicobar'] },
  { slug: 'chandigarh', name: 'Chandigarh', type: 'ut', districts: ['Chandigarh'] },
  { slug: 'dadra-and-nagar-haveli-and-daman-and-diu', name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'ut', districts: ['Dadra and Nagar Haveli', 'Daman', 'Diu'] },
  { slug: 'delhi', name: 'Delhi', type: 'ut', districts: ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'] },
  { slug: 'jammu-and-kashmir', name: 'Jammu and Kashmir', type: 'ut', districts: ['Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 'Ganderbal', 'Jammu', 'Kathua', 'Kishtwar', 'Kulgam', 'Kupwara', 'Pulwama', 'Poonch', 'Rajouri', 'Ramban', 'Reasi', 'Samba', 'Shopian', 'Srinagar', 'Udhampur'] },
  { slug: 'ladakh', name: 'Ladakh', type: 'ut', districts: ['Kargil', 'Leh'] },
  { slug: 'lakshadweep', name: 'Lakshadweep', type: 'ut', districts: ['Lakshadweep'] },
  { slug: 'puducherry', name: 'Puducherry', type: 'ut', districts: ['Karaikal', 'Mahe', 'Puducherry', 'Yanam'] },
]

// ── Check if already seeded ─────────────────────────────────────────
const existing = await db.execute('SELECT COUNT(*) as count FROM categories')
if (Number(existing.rows[0].count) > 0) {
  console.log('Database already seeded')
  db.close()
  process.exit(0)
}

// ── Seed states & districts ─────────────────────────────────────────
for (const st of statesData) {
  await db.execute({
    sql: 'INSERT INTO states (slug, name, type) VALUES (?, ?, ?)',
    args: [st.slug, st.name, st.type],
  })
  for (const d of st.districts) {
    const dSlug = `${st.slug}/${d.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
    await db.execute({
      sql: 'INSERT INTO districts (slug, name, state_slug) VALUES (?, ?, ?)',
      args: [dSlug, d, st.slug],
    })
  }
}

// ── Seed categories ──────────────────────────────────────────────────
const categories = [
  { slug: 'restaurants', name: 'Restaurants', description: 'Best restaurants and dining places' },
  { slug: 'salons', name: 'Salons & Spas', description: 'Beauty salons, spas and grooming services' },
  { slug: 'gyms', name: 'Gyms & Fitness', description: 'Gyms, fitness centers and yoga studios' },
  { slug: 'doctors', name: 'Doctors & Clinics', description: 'Doctors, dentists and medical clinics' },
  { slug: 'plumbers', name: 'Plumbers', description: 'Plumbing services and repair' },
  { slug: 'electricians', name: 'Electricians', description: 'Electrical services and repair' },
  { slug: 'tutors', name: 'Tutors & Classes', description: 'Private tutors and coaching classes' },
  { slug: 'grocery', name: 'Grocery Stores', description: 'Local grocery stores and supermarkets' },
  { slug: 'pharmacies', name: 'Pharmacies', description: 'Medical stores and pharmacies' },
  { slug: 'carpenters', name: 'Carpenters', description: 'Carpentry and furniture services' },
]

for (const cat of categories) {
  await db.execute({
    sql: 'INSERT INTO categories (slug, name, description) VALUES (?, ?, ?)',
    args: [cat.slug, cat.name, cat.description],
  })
}

// ── City → state+district mapping ────────────────────────────────────
const cityMap = [
  { city: 'Mumbai', state: 'maharashtra', district: 'Mumbai City' },
  { city: 'Delhi', state: 'delhi', district: 'Central Delhi' },
  { city: 'Bangalore', state: 'karnataka', district: 'Bengaluru Urban' },
  { city: 'Hyderabad', state: 'telangana', district: 'Hyderabad' },
  { city: 'Chennai', state: 'tamil-nadu', district: 'Chennai' },
  { city: 'Kolkata', state: 'west-bengal', district: 'Kolkata' },
  { city: 'Pune', state: 'maharashtra', district: 'Pune' },
  { city: 'Ahmedabad', state: 'gujarat', district: 'Ahmedabad' },
  { city: 'Jaipur', state: 'rajasthan', district: 'Jaipur' },
  { city: 'Lucknow', state: 'uttar-pradesh', district: 'Lucknow' },
]

function randomRating() {
  return Math.round((3.0 + Math.random() * 2.0) * 10) / 10
}

function randomPhone() {
  const prefixes = ['98', '99', '97', '96', '95', '93', '94', '91', '90']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = String(Math.floor(10000000 + Math.random() * 90000000))
  return `+91 ${prefix}${suffix}`
}

function randomService(category) {
  const serviceMap = {
    restaurants: ['Dine-in', 'Takeaway', 'Home Delivery', 'Catering', 'Party Orders'],
    salons: ['Haircut', 'Facial', 'Manicure', 'Pedicure', 'Shaving'],
    gyms: ['Personal Training', 'Yoga Classes', 'Zumba', 'Cardio', 'Weight Training'],
    doctors: ['OPD', 'Consultation', 'Lab Tests', 'Vaccination', 'Health Checkup'],
    plumbers: ['Pipe Repair', 'Tap Installation', 'Drain Cleaning', 'Water Heater Repair', 'Bathroom Fitting'],
    electricians: ['Wiring', 'Fan Repair', 'AC Installation', 'Switch Board Repair', 'Inverter Setup'],
    tutors: ['Math', 'Science', 'English', 'Hindi', 'Exam Preparation'],
    grocery: ['Daily Needs', 'Fresh Vegetables', 'Packaged Foods', 'Home Delivery', 'Bulk Orders'],
    pharmacies: ['Prescription', 'OTC Medicines', 'Health Supplements', 'Baby Care', 'First Aid'],
    carpenters: ['Furniture Repair', 'Custom Furniture', 'Cabinet Making', 'Door Repair', 'Wood Polish'],
  }
  return serviceMap[category] || ['General Service']
}

function randomArea(city) {
  const areas = {
    Mumbai: ['Andheri', 'Bandra', 'Juhu', 'Malad', 'Powai', 'Worli', 'Colaba', 'Dadar'],
    Delhi: ['Connaught Place', 'Dwarka', 'Rohini', 'Saket', 'Lajpat Nagar', 'Karol Bagh', 'Hauz Khas', 'Pitampura'],
    Bangalore: ['Koramangala', 'Indiranagar', 'Whitefield', 'JP Nagar', 'Jayanagar', 'MG Road', 'Banashankari', 'Marathahalli'],
    Hyderabad: ['Gachibowli', 'Hitech City', 'Banjara Hills', 'Jubilee Hills', 'Madhapur', 'Kukatpally', 'Secunderabad', 'Ameerpet'],
    Chennai: ['T Nagar', 'Velachery', 'Adyar', 'Anna Nagar', 'Mylapore', 'Porur', 'Thoraipakkam', 'Guindy'],
    Kolkata: ['Salt Lake', 'New Town', 'Park Street', 'Ballygunge', 'Dum Dum', 'Howrah', 'Behala', 'Barasat'],
    Pune: ['Koregaon Park', 'Kharadi', 'Hinjewadi', 'Wakad', 'Baner', 'Shivajinagar', 'Hadapsar', 'Pimple Saudagar'],
    Ahmedabad: ['Satellite', 'SG Highway', 'Navrangpura', 'Maninagar', 'Bodakdev', 'Gota', 'Vastrapur', 'Chandkheda'],
    Jaipur: ['Vaishali Nagar', 'Mansarovar', 'Malviya Nagar', 'Tonk Road', 'Sodala', 'Bani Park', 'Raja Park', 'C Scheme'],
    Lucknow: ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Rajajipuram', 'Mahanagar', 'Jankipuram', 'Aminabad'],
  }
  const cityAreas = areas[city] || ['Main Road', 'Market Area', 'Town Center']
  return cityAreas[Math.floor(Math.random() * cityAreas.length)]
}

const businessNames = [
  { name: 'Sharma', suffix: ['Restaurant', 'Sweet Shop', 'General Store'] },
  { name: 'Patel', suffix: ['Pharmacy', 'Grocery', 'Hardware'] },
  { name: 'Singh', suffix: ['Salon', 'Gym', 'Electronics'] },
  { name: 'Gupta', suffix: ['Clinic', 'Tutoring Center', 'Book Store'] },
  { name: 'Reddy', suffix: ['Restaurant', 'Medical Store', 'Fitness Center'] },
  { name: 'Joshi', suffix: ['Ayurvedic Clinic', 'Yoga Studio', 'Catering'] },
  { name: 'Khan', suffix: ['Salon', 'Bakery', 'Tailoring'] },
  { name: 'Verma', suffix: ['Electricals', 'Plumbing Works', 'Hardware Store'] },
  { name: 'Das', suffix: ['Pharmacy', 'General Store', 'Stationery'] },
  { name: 'Nair', suffix: ['Restaurant', 'Catering Service', 'Health Clinic'] },
]

// ── Seed businesses with state+district ──────────────────────────────
let total = 0
for (const cm of cityMap) {
  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci]
    const count = 1 + Math.floor(Math.random() * 3)
    for (let j = 0; j < count; j++) {
      const biz = businessNames[Math.floor(Math.random() * businessNames.length)]
      const suffix = biz.suffix[Math.floor(Math.random() * biz.suffix.length)]
      const name = `${biz.name} ${suffix}`
      const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const slug = `${baseSlug}-${cm.city.toLowerCase()}-${total}`
      const area = randomArea(cm.city)
      const rating = randomRating()
      const services = randomService(cat.slug)
      const verified = Math.random() > 0.4 ? 1 : 0
      const phone = randomPhone()

      await db.execute({
        sql: `INSERT INTO businesses (name, slug, category_id, category_slug, city, district, state, area, address, phone, description, services, rating, reviews_count, verified, views, upvotes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          name, slug, ci + 1, cat.slug, cm.city, cm.district, cm.state, area, `${area}, ${cm.city}`,
          phone,
          `Best ${cat.name.toLowerCase()} service provider in ${area}, ${cm.city}. We offer quality services at affordable prices.`,
          JSON.stringify(services), rating, Math.floor(Math.random() * 200 + 10),
          verified, Math.floor(Math.random() * 5000 + 100), Math.floor(Math.random() * 100 + 1),
        ],
      })
      total++
    }
  }
}

// ── Seed admin ───────────────────────────────────────────────────────
const hash = await bcrypt.hash('admin123', 10)
await db.execute({
  sql: 'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
  args: ['admin', hash],
})

// ── Summary ──────────────────────────────────────────────────────────
const stateCount = await db.execute('SELECT COUNT(*) as c FROM states')
const districtCount = await db.execute('SELECT COUNT(*) as c FROM districts')
console.log(`Seeded: ${stateCount.rows[0].c} states, ${districtCount.rows[0].c} districts, ${categories.length} categories, ${total} businesses, 1 admin`)
db.close()
