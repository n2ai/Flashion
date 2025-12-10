import { Dimensions, Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { ArrowRight, Sparkles, Camera, Shirt, LucideIcon} from 'lucide-react-native';

const {width} = Dimensions.get("window");

type slideType = {
  icon:LucideIcon,
  title:string,
  description:string
}

const onboardingSlides:slideType[] = [
  {
    icon:Shirt,
    title:"Organize Your Wardrobe",
    description:"Keep all your clothes in one place, categorized and easy to find."
  },
  {
    icon:Camera,
    title:"Quick Scan to Add",
    description:"Simply snap a photo to add new items to your digital wardrobe."
  },
  {
    icon:Sparkles,
    title:"AI Outfit Suggestions",
    description: "Get personalized outfit recommendations based on weather and style."
  }
]

export default function Index() {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const SlideIcon = onboardingSlides[currentSlide].icon;
  const SlideTitle = onboardingSlides[currentSlide].title;
  const SlideDescription = onboardingSlides[currentSlide].description;

  const router = useRouter();

  /**Handle Next + Skip button*/
  const handleNext = ():void=>{
    let nextSlide = currentSlide + 1;
    if(nextSlide === 3){
      router.replace("/login");
    }else{
      setCurrentSlide(nextSlide)
    }
  }

  const handleSkip = (): void => {
    router.replace("/login");
  };

  const styles = StyleSheet.create({
    container:{
      flex: 1,
      backgroundColor:"#FFFFFF",
    },
    innerContainer:{
      flex: 1,
      maxWidth: 400,
      width: "100%",
      alignSelf:"center",
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    skipContainer:{
      alignItems: "flex-end",
      paddingTop:15
    },
    skipText: {
      fontSize: 14,
      color: "#9CA3AF",
    },
    mainContent:{
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    }, 
    iconBox:{
      width: 96,
      height: 96,
      borderRadius: 20,
      backgroundColor: "rgba(108, 99, 255, 0.1)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 32,
    },
    title:{
      fontSize: 24,
      fontWeight: "600",
      color: "#111827",
      marginBottom: 12,
      textAlign: "center",
    },
    description:{
      color:"#6B7280",
      maxWidth:240,
      textAlign:"center",
      fontSize:14
    },
    bottomSection:{
      marginTop:24,
    },
    dotsContainer:{
      flexDirection: "row",
      justifyContent: "center",
      gap:8,
      marginBottom: 24,
    },
    dot:{
      height: 8,
      borderRadius: 50
    },
    activeDot:{
      width: 24,
      backgroundColor:"#6C63FF",
    },
    inactiveDot:{
      width: 8,
      backgroundColor: "rgba(100,100,100,0.3)"
    },
    nextButton:{
      width: "100%",
      height: 56,
      backgroundColor: "#6C63FF",
      borderRadius:16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    },
    nextButtonText:{
      color:"white",
      fontSize: 16,
      fontWeight: "500"
    }
  })

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {/**Skip button area*/}
        <View style={styles.skipContainer}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>
              Skip
            </Text>
          </TouchableOpacity>
        </View>

        {/** Main Content Area*/}
        <View style={styles.mainContent}>
          {/**Icon */}
          <View style={styles.iconBox}>
            <SlideIcon size={48} color={"#6C63FF"}></SlideIcon>
          </View>

          {/**Title/Desc*/}
          <Text style={styles.title}>{SlideTitle}</Text>
          <Text style={styles.description}>{SlideDescription}</Text>
        </View>

        {/**Bottom Area */}
        
        {/**Dots */}
        <View style={styles.bottomSection}>
          <View style={styles.dotsContainer}>
            {onboardingSlides.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={()=>setCurrentSlide(index)}
                  style={[
                    styles.dot,
                    index === currentSlide ? styles.activeDot : styles.inactiveDot
                  ]}
                />
              ))}
          </View>
        </View>

        {/**Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentSlide === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <ArrowRight size={20} color={"white"}></ArrowRight>
        </TouchableOpacity>
      </View>
    </View>
  );
}
