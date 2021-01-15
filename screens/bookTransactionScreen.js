import React from 'react'
import {Text,View,TouchableOpacity,StyleSheet, TextInput, Image, Alert,KeyboardAvoidingView,ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config.js';



export default class TransactionScreen extends React.Component{
    constructor(){
        super()
        this.state={
            hasCameraPermission:null,
            scanned:false,
            scannedData:'',
            buttonState:'normal',
            scannedBookId:'',
            scannedStudentId:''
        }
    }
    getCameraPermission=async (id)=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            hasCameraPermission:status==='granted',
            buttonState:id,
            scanned:false
        })
    }
    handleBarCodeScanned=async({type,data})=>{
        const {buttonState}=this.state
        if(buttonState==="BookId"){
            this.setState({
                scanned:true,
                scannedData:data,
                buttonState:'normal'
            })
        }
        else if(buttonState==="StudentId"){
            this.setState({
                scanned:true,
                scannedData:data,
                buttonState:'normal'
            })
        }
        
    }
    initiateBookIssue=async()=>{
        db.collection("transactions").add({
            'studentId':this.state.scannedStudentId,
            'bookId':this.state.scannedBookId,
            'date':firebase.firestore.Timestamp.now().toDate(),
            'transactionType':"issue"
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability':false
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
        })
        Alert.alert("book Issued")
        this.setState({scannedBookId:'',scannedStudentId:''})
    }
    initiateBookReturn=async()=>{
        db.collection("transactions").add({
            'studentId':this.state.scannedStudentId,
            'bookId':this.state.scannedBookId,
            'date':firebase.firestore.Timestamp.now().toDate(),
            'transactionType':"return"
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability':true
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
        })
        Alert.alert("book returned")
        this.setState({scannedBookId:'',scannedStudentId:''})
    }
    handleTransaction=async()=>{
        var transactionMessage
        db.collection("books").doc(this.state.scannedBookId).get()
        .then((doc)=>{
           var book=doc.data()
           if(book.bookAvailability){
               this.initiateBookIssue()
               transactionMessage="book issued"
               ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
           }
           else {
            this.initiateBookReturn()
            transactionMessage="book returned"
            ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
           }
        })
        this.setState({
            transactionMessage:transactionMessage
        })
    }
    render(){
        const hasCameraPermission=this.state.hasCameraPermission
        const scanned=this.state.scanned
        const buttonState=this.state.buttonState
        if(buttonState!=='normal'&&hasCameraPermission){
            return(
                <BarCodeScanner onBarCodeScanned={scanned?undefined:this.handleBarCodeScanned}/>  
            )
        }
        else if(buttonState==='normal'){
        return(
                <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                <View>
                    <Image 
                        source={require("../assets/booklogo.jpg")}
                        style={{width:200,height:200}}>
                    </Image>

                    <Text style={{textAlign:'center',fontSize:30}}>
                        WILY
                    </Text>
                </View>

                <View style={styles.inputView}>
                    <TextInput
                        style={styles.inputBox}
                        placeholder='book id'
                        onChangeText={text=>this.setState({
                            scannedButtonId:text
                        })}
                        value={this.state.scannedBookId}/>
                    <TouchableOpacity style={styles.scanButton}
                        onPress={()=>{
                            this.getCameraPermission("BookId")
                        }}>
                        <Text style={styles.buttonText}>
                            scan
                        </Text>
                    </TouchableOpacity>
                </View>
                        
                <View style={styles.inputView}>
                    <TextInput
                        style={styles.inputBox}
                        placeholder='student id'
                        onChangeText={text=>this.setState({
                            scannedStudentId:text
                        })}
                        value={this.state.scannedStudentId}/>
                    <TouchableOpacity style={styles.scanButton}
                        onPress={()=>{
                            this.getCameraPermission("StudentId")
                        }}>
                        <Text style={styles.buttonText}>
                            scan
                        </Text>
                    </TouchableOpacity>
                </View>
                
                <Text style={
                    styles.displayText
                }>
                    {hasCameraPermission===true?this.state.scannedData:"request camera permission"}
                </Text>
                <TouchableOpacity style={styles.submitButton}
                onPress={async()=>{var transactionMessage=this.handleTransaction()
                    this.setState({scannedBookId:'',scannedStudentId:''})
                }}>
                    <Text style={styles.submitButtonText}>submit</Text>
                </TouchableOpacity>
                </KeyboardAvoidingView>
        )

    }
}}
const styles=StyleSheet.create({
    container:{backgroundColor:'yellow',justifyContent:'center',alignItems:'center'},
    displayText:{fontSize:20,textDecorationColor:'pink',textDecorationLine:'underline'},
    buttonText:{backgroundColor:'yellow',padding:10,margin:10},
    inputView:{flexDirection:'row',margin:20},
    inputBox:{width:200,height:40,borderWidth:1.5,borderRightWidth:0,fontSize:20},
    scanButton:{backgroundColor:'pink',width:50,borderWidth:1.5,borderLeftWidth:0},
    submitButton:{backgroundColor:'yellow',width:100,height:50},
    submitButtonText:{padding:10,textAlign:'center',fontSize:20,fontWeight:"bold",color:'orange'}
})