window.onload = Execute;
	
function Execute(){
    //Set initial variablea
    
    var s = sessionStorage;
    s.clear();
	s.setItem('ProcessTime_hr', document.getElementById('ProcessTime_hr').value);
	s.setItem('targetOUR', document.getElementById('targetOUR').value);
    s.setItem('Innoculum_gram', document.getElementById('Innoculum_gram').value);
    s.setItem('InitialVolume_L', document.getElementById('InitialVolume_L').value);
    s.setItem('GrowthTemp', document.getElementById('GrowthTemp').value);
    s.setItem('ProductionTemp', document.getElementById('ProductionTemp').value);
    s.setItem('TempDropTime_hr', document.getElementById('TempDropTime_hr').value);
    s.setItem('TransitionBiomass_gL', document.getElementById('TransitionBiomass_gL').value);
    s.setItem('xOURmin', document.getElementById('xOURmin').value);
    s.setItem('xOURmax', document.getElementById('xOURmax').value);
    s.setItem('maxProdYield', document.getElementById('maxProdYield').value);
    s.setItem('maxBioYield', document.getElementById('maxBioYield').value);
    s.setItem('maxGrowthRate', document.getElementById('maxGrowthRate').value);
    s.setItem('BioDensity', document.getElementById('BioDensity').value);
    s.setItem('ProdDensity', document.getElementById('ProdDensity').value);
    s.setItem('Carbon_Conc', document.getElementById('Carbon_Conc').value);

    var config = {
        type: 'line',
        data: {},
        options: {
            responsive: true,
            title:{
                display:true,
                text:'Fermentation Chart'
            },
            tooltips: {
                mode: 'label',
                callbacks: {
                    // beforeTitle: function() {
                    //     return '...beforeTitle';
                    // },
                    // afterTitle: function() {
                    //     return '...afterTitle';
                    // },
                    // beforeBody: function() {
                    //     return '...beforeBody';
                    // },
                    // afterBody: function() {
                    //     return '...afterBody';
                    // },
                    // beforeFooter: function() {
                    //     return '...beforeFooter';
                    // },
                    // footer: function() {
                    //     return 'Footer';
                    // },
                    // afterFooter: function() {
                    //     return '...afterFooter';
                    // },
                }
            },
            hover: {
                mode: 'dataset'
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        show: true,
                        labelString: 'Time(hrs)'
                    }
                }],
                yAxes: [{
                    type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    scaleLabel: {
                        ticks:{min:0,},
                        display: true,
                        labelString: 'Titer (g/L)'
                    },
                    position: "left",
                    id: "y-axis-1",
                }, {
                    type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: false,
                    scaleLabel: {
                        ticks:{min:0,},
                        display: true,
                        labelString: 'Specific OUR (mmole/g/hr)'
                    },
                    position: "right",
                    id: "y-axis-2",

                    // grid line settings
                    gridLines: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                }],
            }
        }
    };
               
    
	var RunTest = function(){
        $('#GraphData').prop("disabled",true);
        $('#TiterData').prop("disabled",true);
        $('#YieldData').prop("disabled",true);
        $('#CellSpecificData').prop("disabled",true);
        $('#GasData').prop("disabled",true);
    
		// Get saved data from sessionStorage
		var ProcessTime_hr = s.getItem('ProcessTime_hr');
		var targetOUR = s.getItem('targetOUR');
        var Innoculum_gram = s.getItem('Innoculum_gram');
        var InitialVolume_L = s.getItem('InitialVolume_L');
        var GrowthTemp = s.getItem("GrowthTemp");
        var ProductionTemp = s.getItem("ProductionTemp");
        var TempDropTime_hr = s.getItem("TempDropTime_hr");
        var TransitionBiomass_gL = s.getItem("TransitionBiomass_gL");
        var xOURmin = s.getItem("xOURmin");
        var xOURmax = s.getItem("xOURmax");
        var maxProdYield = s.getItem("maxProdYield");
        var maxBioYield = s.getItem("maxBioYield");
        var maxGrowthRate = s.getItem("maxGrowthRate");
        var BioDensity = s.getItem("BioDensity");
        var ProdDensity = s.getItem("ProdDensity");
        var Carbon_Conc = s.getItem("Carbon_Conc");

              
                //input handles
        var YieldData = {
            Biomass_gL:[0],
            Biomass_gram:[Innoculum_gram],
            Product_gL:[0],
            Product_gram: [0],
            incProdYield:[0],
            ProdYield:[0],
            incBioYield:[maxBioYield],
            BioYield:[0],
            xProd:[0],
            OverallYield:[0],
        };
        var ProcessData = {
            Time_hr:[0],
            Volume_L:[InitialVolume_L],
            GrowthRate:[maxGrowthRate], 
            TempC:[GrowthTemp],
            OUR:[0],
            vOUR:[0],
            xOUR:[xOURmax],
            GrowthFactor:[1],
            Arrhenius:[1.5e15, 91229, 8.3145],
            xCUR:[],         
            GrowthFactor:[1],
            TransTime:0,

            
        };
        var time = 0;
        var time_inc = Number(ProcessTime_hr)/320;
        var xOUR; 
        var y = YieldData;
        var p = ProcessData;
 
        
            var avg = function(array){
                var total = 0;
                for (var x = 0; x < array.length;x+=1){
                    total = array[x]+total;         
                }
                return total/array.length
            };

            var fTemp_C = function(startTemp,EndTemp,dropTime,transBio,TransTime,Biomass_gL){ 
                var Biomass_gL;
                var TempC;
                var TransTime;
                if (i===0){Biomass_gL = y.Biomass_gL[0];}
                else {Biomass_gL = y.Biomass_gL[i-1];}
                
                
                if (Biomass_gL > transBio) {
                    TempC = p.TempC[i-1] - time_inc*(startTemp - EndTemp)/dropTime;
                } 
                else if (TransTime > 0 && Biomass_gL < transBio){
                    TempC = EndTemp;
                }
                else if (Biomass_gL < transBio) {
                    TempC = startTemp;
                }  

                if (startTemp > EndTemp && TempC < EndTemp) {
                    TempC = EndTemp;
                }    
                else if (startTemp < EndTemp && TempC > EndTemp) {
                    TempC = EndTemp;
                }
                    
                return TempC;  
            };
            var fGrowthRate = function(PreExpFactor, ActEnergy, GasConstant, Thing,tempInhibition) {
                var GrowthFactor;
                var GrowthRate;
                if (i===0){GrowthFactor = 1;}
                else {GrowthFactor = p.GrowthFactor[i-1];}
                GrowthRate = PreExpFactor*Math.exp(-ActEnergy/(GasConstant*(Thing + 273.15)));
                GrowthRate = GrowthRate*tempInhibition;
                return GrowthRate;
            };

            var fBiomass_gram = function(initBio_gram, fGrowthRate, time_inc){
                var Total_Biomass_gram;
                //var GrowthRate = GrowthRate;
                if (i===0){Total_Biomass_grams = initBio_gram;}
                else {
                    Total_Biomass_grams = y.Biomass_gram[i-1]*Math.exp(fGrowthRate*time_inc);}
                return Total_Biomass_grams;
            };
            
            var fProduct_gram = function(initProd_gram, xProd, time_inc, Biomass_gram){
                var Total_Product_gram = 0;
                if (i===0){Total_Product_gram = initProd_gram;}
                else {
                    Total_Product_gram = y.Product_gram[i-1] + xProd*time_inc*Biomass_gram;
                }
                return Total_Product_gram;
            };
            var Volume_Total_L = function(fBiomass_gram,fProduct_gram){
 
                var BioH2O = fBiomass_gram/avg(y.incBioYield)/1000;
                var ProdH2O = fProduct_gram/avg(y.incProdYield)/1000; 
                var Total_Volume_L; 
                if (i===0){
                    Total_Volume_L = Number(InitialVolume_L);//InitialVolume_L;
                }
                else {
                    Total_Volume_L = fProduct_gram/1000/ProdDensity+fBiomass_gram/1000/BioDensity+(ProdH2O + BioH2O)*(1 - Carbon_Conc)/Carbon_Conc + Number(InitialVolume_L);//InitialVolume_L;
                    if (Total_Volume_L<p.Volume_L[i-1]) {Total_Volume_L=p.Volume_L[i-1]};
                }
                return Total_Volume_L;
            }; 

        for (var i = 0 ;i <= ProcessTime_hr/time_inc; i++){
            //Temperature Calculation

            //Call Functions

            var TempC = fTemp_C(Number(GrowthTemp)-.2,Number(ProductionTemp),Number(TempDropTime_hr),Number(TransitionBiomass_gL),p.TransTime);
            
            
            //TempInhibition
            var PreExp = 1.09e13;
            var ActEne = 77410;
            var GasCon = 8.3145;

            var tempInhibition = PreExp*Math.exp(-ActEne/(GasCon*(TempC + 273.15)));


            //var GrowthRate = fGrowthRate(p.Arrhenius[0], p.Arrhenius[1], p.Arrhenius[2], TempC,tempInhibition);
            //var maxGrowthRate = 0.006+p.Arrhenius[0]*Math.exp(-p.Arrhenius[1]/(p.Arrhenius[2]*(37 + 273.15)));
            
            var xOURtemp = tempInhibition*xOURmax
            
            var UptakeRate = maxGrowthRate*tempInhibition
            var maxCUR = UptakeRate/maxBioYield;

            //var xOURmin = UptakeRate/maxGrowthRate*xOURmax*maxProdYield/maxBioYield;
            

            if (i===0){GrowthFactor = 1;}
            else {GrowthFactor = p.GrowthFactor[i-1];}
            
            var GrowthRate2 = GrowthFactor*UptakeRate;
           
            var incBioYield = GrowthRate2/maxGrowthRate*Number(maxBioYield);
            var incProdYield = (1 - GrowthRate2/maxGrowthRate)*Number(maxProdYield); 

            var xProd = (maxCUR*maxBioYield-maxCUR*incBioYield)*incProdYield;    
            
            var Biomass_gram = fBiomass_gram(Number(Innoculum_gram)*Number(InitialVolume_L),GrowthRate2,time_inc);
            var Product_gram = fProduct_gram(y.Product_gram[0],xProd,time_inc,Biomass_gram);     
            var Volume_L = Volume_Total_L(Biomass_gram,Product_gram);

            var Product_gL = Product_gram/Volume_L;
            var Biomass_gL = Biomass_gram/Volume_L;

            //console.log(Volume_L); 

            var vOURmax = xOURtemp*Biomass_gL;
            var vOTR = targetOUR/Volume_L;
            var vOURratio = vOTR/vOURmax;
            xOUR = vOTR/Biomass_gL;      
            
            if (xOUR>xOURtemp) {
                xOUR = xOURtemp;
            };

            var GrowthFactor = xOUR*1/(xOURtemp-xOURmin)+1-1/(xOURtemp-xOURmin)*xOURtemp;
            
            if (GrowthFactor>1) {GrowthFactor=1;}
            else if (GrowthFactor < 0){GrowthFactor = 0;}

            var vOUR = Biomass_gL*xOUR; 
            var OUR = vOUR*Volume_L;

            if(Biomass_gL>TransitionBiomass_gL){
                p.TransTime = time;
            };

            p.xOUR[i] = parseFloat(xOUR).toFixed(1); //Nan
            p.xCUR[i] = parseFloat(UptakeRate).toFixed(3);
            p.vOUR[i] = parseFloat(vOUR).toFixed(1);
            p.OUR[i] = OUR;
            p.Time_hr[i] = time;        
            p.Volume_L[i] = parseFloat(Volume_L).toFixed(2);
            p.TempC[i] = parseFloat(TempC).toFixed(1);      
            p.GrowthRate[i] = parseFloat(GrowthRate2).toFixed(3);   
            y.Biomass_gL[i] = parseFloat(Biomass_gL).toFixed(2); 
            y.Biomass_gram[i] = parseFloat(Biomass_gram).toFixed(2); 
            y.Product_gL[i] = parseFloat(Product_gL).toFixed(2);
            y.Product_gram[i] = parseFloat(Product_gram).toFixed(2); 
            y.incProdYield[i] = parseFloat(incProdYield).toFixed(2); 
            y.ProdYield[i] = avg(y.incProdYield);
            y.incBioYield[i] = parseFloat(incBioYield).toFixed(2); 
            y.BioYield[i] = avg(y.incBioYield); //good
            y.xProd[i] = parseFloat(xProd).toFixed(3); //good
            y.OverallYield[i] = y.ProdYield[i] + y.BioYield[i];

            p.GrowthFactor[i] = GrowthFactor;

            time = time + time_inc;


        } 
//___________________This is the End of the For LOOOOOP___________



        //_________Color Definition_________
        var dotSize = 2;
//___________Below is the color information
        var Line_Biomass_gL = "rgba(76,118,225,1)";
        var pointBorder_Biomass_gL = "rgba(24,58,144,1)";
        var pointBackground_Biomass_gL = "rgba(76,118,225,1)";
        var backgroundColor_Biomass_gL = "rgba(76,118,225,1)";

        var Line_Product_gL = "rgba(231,110,80,1)";
        var pointBorder_Product_gL = "rgba(171,53,23,1)";
        var pointBackground_Product_gL = "rgba(231,110,80,1)";
        var backgroundColor_Product_gL = "rgba(231,110,80,1)";

        var Line_incProdYield = "rgba(228,134,58,1)";
        var pointBorder_incProdYield = "rgba(171,90,23,1)";
        var pointBackground_incProdYield = "rgba(228,134,58,1)";
        var backgroundColor_incProdYield = "rgba(228,134,58,1)";

        var Line_incBioYield = "rgba(55,157,200,1)";
        var pointBorder_incBioYield = "rgba(36,103,132,1)";
        var pointBackground_incBioYield = "rgba(55,157,200,1)";
        var backgroundColor_incBioYield = "rgba(55,157,200,1)";

        var Line_OverallYield = "rgba(61,61,61,1)";
        var pointBorder_OverallYield = "rgba(38,38,38,1)";
        var pointBackground_OverallYield = "rgba(61,61,61,1)";
        var backgroundColor_OverallYield = "rgba(61,61,61,1)";

        var Line_vOUR = "rgba(0,200,240,1)";
        var pointBorder_vOUR = "rgba(0,132,158,1)";
        var pointBackground_vOUR = "rgba(0,200,240,1)";
        var backgroundColor_vOUR = "rgba(0,200,240,1)";

        var Line_xOUR = "rgba(0,255,255,1)";
        var pointBorder_xOUR = "rgba(0,168,165,1)";
        var pointBackground_xOUR = "rgba(0,255,255,1)";
        var backgroundColor_xOUR = "rgba(0,255,255,1)";

        var Line_Volume_L = "rgba(100,100,100,1)";
        var pointBorder_Volume_L = "rgba(64,64,64,1)";
        var pointBackground_Volume_L = "rgba(100,100,100,1)";
        var backgroundColor_Volume_L = "rgba(100,100,100,1)";

        var Line_Temp_C = "rgba(9,128,5,1)";
        var pointBorder_Temp_C = "rgba(7,103,4,1)";
        var pointBackground_Temp_C = "rgba(9,128,5,1)";
        var backgroundColor_Temp_C = "rgba(9,128,5,1)";

        var Line_GrowthRate = "rgba(255,210,31,1)";
        var pointBorder_GrowthRate = "rgba(224,180,0,1)";
        var pointBackground_GrowthRate = "rgba(255,210,31,1)";
        var backgroundColor_GrowthRate = "rgba(255,210,31,1)";

        

        var xAxis = [];
        for (i=0;i < p.Time_hr.length; i++){
            
            if ((i)%5 ===0){
            xAxis[i] = Math.round(p.Time_hr[i]);
            }
            else {xAxis[i] = " ";}
        };
        
        if (s.getItem('TiterClick')) {
            config.options.title.text = "Titer Data";
            config.options.scales.yAxes[0].scaleLabel.labelString = 'Titer (g/L)';
            config.options.scales.yAxes[1].scaleLabel.labelString = 'GrowthRate (hr^-1)';
            config.options.scales.yAxes[1].display = true;
            config.data = {
                    labels: xAxis,
                    datasets: [{
                        label: 'Biomass (g/L)',
                        data: y.Biomass_gL,
                        fill: false,
                        yAxisID: "y-axis-1",
                        borderColor: pointBackground_Biomass_gL, 
                        pointBorderColor: pointBorder_Biomass_gL,
                        pointBackgroundColor: pointBackground_Biomass_gL,
                        backgroundColor: backgroundColor_Biomass_gL,
                        pointRadius: dotSize,
                        
                    }, {
                        label: 'Product (g/L)',
                        fill: false,
                        data: y.Product_gL,
                        borderColor: pointBackground_Product_gL, 
                        pointBorderColor: pointBorder_Product_gL,
                        pointBackgroundColor: pointBackground_Product_gL,
                        backgroundColor: backgroundColor_Product_gL,
                        pointRadius: dotSize,
                        yAxisID: "y-axis-1",
                    }, {
                        label: 'GrowthRate (hr^-1)',
                        fill: false,
                        data: p.GrowthRate,
                        borderColor: pointBackground_GrowthRate, 
                        pointBorderColor: pointBorder_GrowthRate,
                        pointBackgroundColor: pointBackground_GrowthRate,
                        backgroundColor: backgroundColor_GrowthRate,
                        pointRadius: dotSize,
                        yAxisID: "y-axis-2",
                    }, {
                        label: "Temp (C)",
                        data: p.TempC,
                        borderColor: pointBackground_Temp_C, 
                        pointBorderColor: pointBorder_Temp_C,
                        pointBackgroundColor: pointBackground_Temp_C,
                        backgroundColor: backgroundColor_Temp_C,
                        pointRadius: dotSize,
                        fill: false,
                        yAxisID: "y-axis-1",
                    }]
            }
        }
        else if (s.getItem('YieldClick')) {
            config.options.title.text = "Yield Data";
            config.options.scales.yAxes[0].scaleLabel.labelString = 'Yield (g/g)';
            config.options.scales.yAxes[1].display = false; 
            config.data = {
                    labels: xAxis,
                    datasets: [{
                        label: "Overall Yield (g/g)",
                        data: y.OverallYield,
                        fill: false,
                        yAxisID: "y-axis-1",
                        borderColor: pointBackground_OverallYield, 
                        pointBorderColor: pointBorder_OverallYield,
                        pointBackgroundColor: pointBackground_OverallYield,
                        backgroundColor: backgroundColor_OverallYield,
                        pointRadius: dotSize,
                    }, 
                    {
                        label: "Product Yield (g/g)",
                        data: y.ProdYield,
                        fill: false,
                        yAxisID: "y-axis-1",
                        borderColor: pointBackground_Product_gL, 
                        pointBorderColor: pointBorder_Product_gL,
                        pointBackgroundColor: pointBackground_Product_gL,
                        backgroundColor: backgroundColor_Product_gL,
                        pointRadius: dotSize,
                    }, 
                    {
                        label: "Biomass Yield (g/g)",
                        data: y.BioYield,
                        fill: false,
                        yAxisID: "y-axis-1",
                        borderColor: pointBackground_Biomass_gL, 
                        pointBorderColor: pointBorder_Biomass_gL,
                        pointBackgroundColor: pointBackground_Biomass_gL,
                        backgroundColor: backgroundColor_Biomass_gL,
                        pointRadius: dotSize,
                    }, {
                        label: "Inc Prod Yield (g/g)",
                        data: y.incProdYield,
                        fill: false,
                        yAxisID: "y-axis-1",
                        borderColor: pointBackground_incProdYield, 
                        pointBorderColor: pointBorder_incProdYield,
                        pointBackgroundColor: pointBackground_incProdYield,
                        backgroundColor: backgroundColor_incProdYield,
                        pointRadius: dotSize,
                    }, {
                        label: "Inc Bio Yield (g/g)",
                        fill: false,
                        data: y.incBioYield,
                        yAxisID: "y-axis-1",
                        borderColor: pointBackground_incBioYield, 
                        pointBorderColor: pointBorder_incBioYield,
                        pointBackgroundColor: pointBackground_incBioYield,
                        backgroundColor: backgroundColor_incBioYield,
                        pointRadius: dotSize,
                    }]
            }
        }
        else if (s.getItem('CellClick')) {
            config.options.title.text = "Cell Specific Data";
            config.options.scales.yAxes[1].scaleLabel.labelString = 'Specific Data (g/g/hr)';
            config.options.scales.yAxes[1].display = true;
            config.data = {
                labels: xAxis,
                datasets: [{
                    label: "Specifc Productivity (g/g/hr)",
                    fill: false,
                    data: y.xProd,
                    yAxisID: "y-axis-1",
                    borderColor: pointBackground_incBioYield, 
                    pointBorderColor: pointBorder_incBioYield,
                    pointBackgroundColor: pointBackground_incBioYield,
                    backgroundColor: backgroundColor_incBioYield,
                    pointRadius: dotSize,
                },
                {
                    label: "Specific Carbon Uptake (g/g/hr)",
                    fill: false,
                    data: p.xCUR,
                    yAxisID: "y-axis-1",
                    borderColor: pointBackground_vOUR, 
                    pointBorderColor: pointBorder_vOUR,
                    pointBackgroundColor: pointBackground_vOUR,
                    backgroundColor: backgroundColor_vOUR,
                    pointRadius: dotSize,

                }, 
                {
                    label: "Specific OUR (mmole/g/hr)",
                    data: p.xOUR,
                    fill: false,
                    yAxisID: "y-axis-2",
                    borderColor: pointBackground_xOUR, 
                    pointBorderColor: pointBorder_xOUR,
                    pointBackgroundColor: pointBackground_xOUR,
                    backgroundColor: backgroundColor_xOUR,
                    pointRadius: dotSize,
                }]
            }
        }
        else if (s.getItem('GasClick')) {
            config.options.title.text = "Yield Data";
            config.options.scales.yAxes[1].scaleLabel.labelString = 'Specific OUR (g/g/hr)';
            config.options.scales.yAxes[1].display = true;
            config.data = {
                labels: xAxis,
                datasets: [{
                    label: "vOUR (mM/hr)",
                    fill: false,
                    data: p.vOUR,
                    yAxisID: "y-axis-1",
                    borderColor: pointBackground_vOUR, 
                    pointBorderColor: pointBorder_vOUR,
                    pointBackgroundColor: pointBackground_vOUR,
                    backgroundColor: backgroundColor_vOUR,
                    pointRadius: dotSize,

                }, 
                {
                    label: "Specific OUR (g/g/hr)",
                    data: p.xOUR,
                    fill: false,
                    yAxisID: "y-axis-2",
                    borderColor: pointBackground_xOUR, 
                    pointBorderColor: pointBorder_xOUR,
                    pointBackgroundColor: pointBackground_xOUR,
                    backgroundColor: backgroundColor_xOUR,
                    pointRadius: dotSize,
                }]
            }
        }
        else {
            config.options.title.text = "Fermentation Data";
            config.options.scales.yAxes[0].scaleLabel.labelString = 'vOUR (mM/hr)';
            config.options.scales.yAxes[1].scaleLabel.labelString = 'Titer (g/L) & Volume (L)';
            config.options.scales.yAxes[1].display = true;
            config.data = {
                    labels: xAxis,
                    datasets: [{
                        label: "Volume (L)",
                        data: p.Volume_L,
                        borderColor: pointBackground_Volume_L, 
                        pointBorderColor: pointBorder_Volume_L,
                        pointBackgroundColor: pointBackground_Volume_L,
                        backgroundColor: backgroundColor_Volume_L,
                        pointRadius: dotSize,
                        fill: false,
                        yAxisID: "y-axis-2",
                    },{
                        label: "Temp (C)",
                        data: p.TempC,
                        borderColor: pointBackground_Temp_C, 
                        pointBorderColor: pointBorder_Temp_C,
                        pointBackgroundColor: pointBackground_Temp_C,
                        backgroundColor: backgroundColor_Temp_C,
                        pointRadius: dotSize,
                        fill: false,
                        yAxisID: "y-axis-2",
                    },  
                    {
                        fill: false,
                        label: 'Biomass_gL',
                        data: y.Biomass_gL,
                        borderColor: pointBackground_Biomass_gL, 
                        pointBorderColor: pointBorder_Biomass_gL,
                        pointBackgroundColor: pointBackground_Biomass_gL,
                        backgroundColor: backgroundColor_Biomass_gL,
                        pointRadius: dotSize,
                        yAxisID: "y-axis-2",
                    }, {
                        fill: false,
                        label: 'Product_gL',
                        data: y.Product_gL,
                        borderColor: pointBackground_Product_gL, 
                        pointBorderColor: pointBorder_Product_gL,
                        pointBackgroundColor: pointBackground_Product_gL,
                        backgroundColor: backgroundColor_Product_gL,
                        pointRadius: dotSize,
                        yAxisID: "y-axis-2",
                    }, {
                        label: "vOUR (mM/hr)",
                        fill: false,
                        data: p.vOUR,
                        borderColor: pointBackground_vOUR, 
                        pointBorderColor: pointBorder_vOUR,
                        pointBackgroundColor: pointBackground_vOUR,
                        backgroundColor: backgroundColor_vOUR,
                        pointRadius: dotSize,
                        yAxisID: "y-axis-1",
                    }]
            }
        }

        $.each(config.data.datasets, function(i, dataset) {
        });
        function getMaxOfArray(numArray) {
             return Math.max.apply(null, numArray);
        }
        ProdYield = parseFloat(getMaxOfArray(y.ProdYield)).toFixed(2);
        Volume_L = parseFloat(getMaxOfArray(p.Volume_L)).toFixed(1);
        Product_gL = parseFloat(getMaxOfArray(y.Product_gL)).toFixed(0);
        Product_gram = parseFloat(getMaxOfArray(y.Product_gram)).toFixed(0);
        incProdYield = parseFloat(getMaxOfArray(y.incProdYield)).toFixed(2);
        var MaxvOUR = parseFloat(getMaxOfArray(p.vOUR)).toFixed(0);
        var newBiomass_gL = parseFloat(getMaxOfArray(y.Biomass_gL)).toFixed(1);
        var newBiomass_gram = parseFloat(getMaxOfArray(y.Biomass_gram)).toFixed(0);
        var xProdmax = parseFloat(getMaxOfArray(y.xProd)).toFixed(3);
        var newOverallYield = parseFloat(y.OverallYield.pop()).toFixed(2)
        ;
        
        //var largest = Math.max.apply(Math, y.ProdYield);                  

        $( document ).ready(function() {
        $("#1").text("Product Yield (g/g):"+ProdYield);
        $("#2").text("Final Volume (L):             "+Volume_L);
        $("#3").text("Product Titer (g/L):          "+Product_gL);
        $("#4").text("Total Product (g):            "+Product_gram);
        $("#5").text("Biomass Titer max (g/L):      "+ newBiomass_gL);
        $("#6").text("Total Biomass (g):            "+ newBiomass_gram);
        $("#7").text("Overall Yield (g/g):          "+newOverallYield);
        $("#8").text("Inc. Product Yield max (g/g): "+incProdYield);
        $("#9").text("vOUR max (mM/hr):             "+ MaxvOUR);
        $("#10").text("Productivity max (g/g/hr):   "+ xProdmax);
        }); 

        var ctx = document.getElementById("canvas").getContext("2d");
        window.myLine = new Chart(ctx, config);   

        setTimeout(EnableButtons,750);
	};
    
    $( document ).ready(RunTest);
  
    var EnableButtons = function(){   
    $('#GraphData').prop("disabled",false);
    $('#TiterData').prop("disabled",false);
    $('#YieldData').prop("disabled",false);
    $('#GasData').prop("disabled",false);
    $('#CellSpecificData').prop("disabled",false);
    }

    setTimeout(EnableButtons,750);
	
    //RunTest();
    var input_ProcessTime_hr = document.getElementById("ProcessTime_hr");
    var input_targetOUR = document.getElementById("targetOUR");
    var input_Innoculum_gram = document.getElementById("Innoculum_gram");
    var input_InitialVolume_L = document.getElementById("InitialVolume_L");
    var input_GrowthTemp = document.getElementById("GrowthTemp");
    var input_ProductionTemp = document.getElementById("ProductionTemp");
    var input_TempDropTime_hr = document.getElementById("TempDropTime_hr");
    var input_TransitionBiomass_gL = document.getElementById("TransitionBiomass_gL");
    var input_xOURmin = document.getElementById("xOURmin");
    var input_xOURmax = document.getElementById("xOURmax");
    var input_maxProdYield = document.getElementById("maxProdYield");
    var input_maxBioYield = document.getElementById("maxBioYield");
    var input_maxGrowthRate = document.getElementById("maxGrowthRate");
    var input_BioDensity = document.getElementById("BioDensity");
    var input_ProdDensity = document.getElementById("ProdDensity");
    var input_Carbon_Conc = document.getElementById("Carbon_Conc");
 
    var SetInputs = function(){

        s.clear();
        var GrowthTemp, ProcessTime_hr, targetOUR, Innoculum_gram,InitialVolume_L,ProductionTemp,TempDropTime_hr,TransitionBiomass_gL,xOURmin,xOURmax,maxProdYield,maxBioYield,maxGrowthRate,BioDensity,ProdDensity,Carbon_Conc;

        var variables = ['GrowthTemp','ProcessTime_hr','targetOUR','Innoculum_gram','InitialVolume_L','TempDropTime_hr','TransitionBiomass_gL','xOURmin','xOURmax','maxProdYield','maxBioYield','maxGrowthRate','BioDensity','ProdDensity','Carbon_Conc'];
    
        var setVariables = [input_GrowthTemp.value,input_ProcessTime_hr.value, input_targetOUR.value,input_Innoculum_gram.value,input_InitialVolume_L.value,input_TempDropTime_hr.value,input_TransitionBiomass_gL.value,input_xOURmin.value,input_xOURmax.value,input_maxProdYield.value,input_maxBioYield.value,input_maxGrowthRate.value,input_BioDensity.value,input_ProdDensity.value,input_Carbon_Conc.value];
      
        var min = [input_GrowthTemp.min,input_ProcessTime_hr.min,input_targetOUR.min,input_Innoculum_gram.min,input_InitialVolume_L.min,input_TempDropTime_hr.min,input_TransitionBiomass_gL.min,input_xOURmin.min,input_xOURmax.min,input_maxProdYield.min,input_maxBioYield.min,input_maxGrowthRate.min,input_BioDensity.min,input_ProdDensity.min,input_Carbon_Conc.min];
        

        var max = [input_GrowthTemp.max,input_ProcessTime_hr.max,input_targetOUR.max,input_Innoculum_gram.max,input_InitialVolume_L.max,input_TempDropTime_hr.max,input_TransitionBiomass_gL.max,input_xOURmin.max,input_xOURmax.max,input_maxProdYield.max,input_maxBioYield.max,input_maxGrowthRate.max,input_BioDensity.max,input_ProdDensity.max,input_Carbon_Conc.max];
        var PreExp = 1.09e13;
        var ActEne = 77410;
        var GasCon = 8.3145;

        var fix = PreExp*Math.exp(-ActEne/(GasCon*(Math.min(input_GrowthTemp.value,input_ProductionTemp.value) + 273.15)));
        max[7] = parseFloat(input_xOURmax.value*fix*.85).toFixed(1);

        for (i=0; i < setVariables.length;i++) {
            var value = Number(setVariables[i]);

            if (value > max[i]) {
                value = max[i];
                $('#'+variables[i]).val(value);
            }
            else if (value < min[i]) {
                value = min[i];
                $('#'+variables[i]).val(value);
            }
            $('#'+variables[i]).val(value);
            setVariables[i] = value;  
            s.setItem(variables[i],value);     
        }

        ProductionTemp = input_ProductionTemp.value;
        if (ProductionTemp > input_GrowthTemp.max) {
            ProductionTemp = input_GrowthTemp.max;
             $("#ProductionTemp").val(ProductionTemp);
        }
        else if (ProductionTemp < input_ProductionTemp.min) {
            ProductionTemp = input_ProductionTemp.min;
            $("#ProductionTemp").val(ProductionTemp);
        }


        s.setItem('ProductionTemp',ProductionTemp);
        
    };

	$('#GraphData').click(function() {
        SetInputs();    
        myLine.destroy();
		RunTest();   
    });//end of function

    $('#TiterData').click(function() {
        SetInputs();
        s.setItem('TiterClick', 1);
        myLine.destroy();
        RunTest(); 
    });
    $('#YieldData').click(function() {
        SetInputs();
        s.setItem('YieldClick', 1);        
        myLine.destroy();
        RunTest(); 
    });
    $('#GasData').click(function() {
        SetInputs();
        s.setItem('GasClick', 1);
        myLine.destroy();
        RunTest(); 
    });
        $('#CellSpecificData').click(function() {
        SetInputs();
        s.setItem('CellClick', 1);
        myLine.destroy();
        RunTest(); 
    });
};