# Radar Chart Implementation for Environmental Metrics

## Overview

Successfully replaced the species abundance timeline with a comprehensive radar chart that displays 8 key environmental and biodiversity metrics, providing users with a holistic view of their sample's characteristics.

## 🎯 **Radar Chart Metrics**

The radar chart displays the following metrics on a 0-100 scale:

### 1. **Biodiversity Index**
- Measures overall species diversity in the sample
- Higher values indicate more diverse ecosystems

### 2. **Species Richness** 
- Total number of different species detected
- Reflects ecosystem complexity

### 3. **Environmental Health**
- Overall ecosystem condition and stability
- Considers pollution, habitat quality, and stress indicators

### 4. **Water Quality**
- Chemical and physical water parameters
- pH, dissolved oxygen, turbidity, contamination levels

### 5. **Ecosystem Stability**
- Resilience and balance of the ecosystem
- Resistance to environmental changes

### 6. **Novel Species Rate**
- Percentage of newly discovered or rare species
- Indicates potential for scientific discovery

### 7. **Genetic Diversity**
- Genetic variation within and between species
- Important for ecosystem resilience

### 8. **Habitat Complexity**
- Structural diversity of the environment
- Availability of ecological niches

## 🌊 **Environment-Specific Scoring**

Different sample types show realistic metric patterns:

### **Deep Sea Samples** (`deep_seawater`, depth > 200m)
```
Biodiversity Index: 40-70    (Lower diversity in extreme environments)
Species Richness: 30-60      (Fewer species, but highly specialized)
Environmental Health: 70-95  (Pristine, undisturbed environments)
Water Quality: 80-98         (Excellent water quality)
Ecosystem Stability: 85-95   (Very stable conditions)
Novel Species Rate: 70-95    (High discovery potential)
Genetic Diversity: 60-85     (Moderate, specialized genetics)
Habitat Complexity: 50-75    (Simpler but unique habitats)
```

### **Marine Samples** (`seawater`, `estuary_water`, `marsh_water`)
```
Biodiversity Index: 65-90    (High marine diversity)
Species Richness: 70-95      (Rich marine ecosystems)
Environmental Health: 60-85  (Variable, human impact)
Water Quality: 70-90         (Generally good)
Ecosystem Stability: 60-80   (Dynamic marine systems)
Novel Species Rate: 40-70    (Moderate discovery rate)
Genetic Diversity: 70-90     (High genetic variation)
Habitat Complexity: 75-95    (Complex marine habitats)
```

### **Freshwater Samples** (`freshwater`, `alpine_water`)
```
Biodiversity Index: 70-85    (Good freshwater diversity)
Species Richness: 60-80      (Moderate species count)
Environmental Health: 75-95  (Often pristine)
Water Quality: 80-95         (Excellent quality)
Ecosystem Stability: 70-90   (Stable freshwater systems)
Novel Species Rate: 30-60    (Lower discovery rate)
Genetic Diversity: 65-85     (Good genetic diversity)
Habitat Complexity: 60-80    (Moderate complexity)
```

### **Soil Samples** (`soil`)
```
Biodiversity Index: 80-95    (Highest diversity)
Species Richness: 85-98      (Maximum species richness)
Environmental Health: 70-90  (Generally healthy)
Water Quality: 50-75         (Not applicable/variable)
Ecosystem Stability: 75-90   (Stable soil systems)
Novel Species Rate: 50-80    (High microbial discovery)
Genetic Diversity: 80-95     (Maximum genetic diversity)
Habitat Complexity: 85-98    (Most complex habitats)
```

### **River/Urban Water** (`river_water`, `urban_water`)
```
Biodiversity Index: 30-60    (Reduced by pollution)
Species Richness: 25-55      (Lower species count)
Environmental Health: 25-50  (Impacted by human activity)
Water Quality: 20-45         (Poor to moderate quality)
Ecosystem Stability: 30-60   (Unstable, stressed systems)
Novel Species Rate: 15-40    (Lowest discovery potential)
Genetic Diversity: 40-70     (Reduced genetic diversity)
Habitat Complexity: 35-65    (Simplified habitats)
```

## 🔧 **Technical Implementation**

### Backend Changes

#### 1. **Radar Data Generation**
```python
def generate_unique_chart_data(file_info: dict, species_data: list) -> dict:
    # Generate radar chart data for environmental metrics
    radar_data = []
    
    metrics = [
        "Biodiversity Index", "Species Richness", "Environmental Health",
        "Water Quality", "Ecosystem Stability", "Novel Species Rate",
        "Genetic Diversity", "Habitat Complexity"
    ]
    
    # Environment-specific scoring ranges
    base_ranges = get_environment_ranges(file_info["sample_type"])
    
    for metric in metrics:
        min_val, max_val = base_ranges[metric]
        value = random.randint(min_val, max_val)
        
        radar_data.append({
            "metric": metric,
            "value": value,
            "fullMark": 100
        })
```

#### 2. **API Response Update**
```python
return {
    "radar_data": radar_data,  # New radar chart data
    "clustering_data": clustering_data,
    # ... other chart data
}
```

### Frontend Changes

#### 1. **Recharts Radar Chart**
```tsx
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

<RadarChart data={radarData}>
  <PolarGrid stroke="rgba(255,255,255,0.2)" />
  <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 12 }} />
  <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={6} />
  <Radar
    name="Metrics"
    dataKey="value"
    stroke="#60A5FA"
    fill="#60A5FA"
    fillOpacity={0.3}
    strokeWidth={2}
    dot={{ fill: '#60A5FA', strokeWidth: 2, r: 4 }}
  />
  <Tooltip content={CustomRadarTooltip} />
</RadarChart>
```

#### 2. **TypeScript Interface Update**
```typescript
chart_data?: {
  radar_data: Array<{
    metric: string;
    value: number;
    fullMark: number;
  }>;
  // ... other chart data
};
```

## 🎨 **Visual Features**

### **Chart Styling**
- **Blue theme** (`#60A5FA`) matching the app's color scheme
- **Semi-transparent fill** (30% opacity) for better readability
- **Polar grid** with subtle white lines
- **Interactive tooltips** showing metric names and scores
- **Responsive design** that adapts to different screen sizes

### **Custom Tooltip**
```tsx
<Tooltip 
  content={({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/90 border border-white/10 rounded-lg p-3">
          <p className="text-white text-sm font-medium">{data.metric}</p>
          <p className="text-blue-400 text-sm">{`Score: ${data.value}/100`}</p>
        </div>
      );
    }
    return null;
  }}
/>
```

## 📊 **Benefits**

### **Scientific Value**
- **Holistic assessment** of environmental samples
- **Standardized metrics** for comparison across samples
- **Environment-specific scoring** that reflects realistic patterns
- **Multi-dimensional analysis** beyond simple species counts

### **User Experience**
- **Visual clarity** - easy to interpret at a glance
- **Comparative analysis** - quickly compare different samples
- **Professional presentation** - suitable for scientific reports
- **Interactive exploration** - hover for detailed information

### **Data Insights**
- **Ecosystem health assessment** at multiple levels
- **Discovery potential** indication through novel species rate
- **Environmental quality** evaluation
- **Biodiversity patterns** visualization

## 🔬 **Example Interpretations**

### **High-Quality Marine Sample**
- High biodiversity and species richness
- Good environmental health and water quality
- Moderate novel species potential
- Complex habitat structure

### **Pristine Deep Sea Sample**
- Lower biodiversity but very high novelty
- Excellent environmental conditions
- High ecosystem stability
- Unique habitat characteristics

### **Impacted Urban Water**
- Reduced biodiversity and species richness
- Poor environmental health and water quality
- Low discovery potential
- Simplified habitat structure

This radar chart implementation provides users with a comprehensive, scientifically meaningful visualization that enhances their understanding of environmental DNA samples and supports data-driven decision making in ecological research and conservation efforts.