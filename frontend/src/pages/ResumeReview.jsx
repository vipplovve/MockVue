import { useContext, useState, useMemo } from 'react'
import Card from '../components/Card'
import Progress from '../components/Progress'
import ScrollArea from '../components/ScrollArea'
import { ChevronDown, ChevronUp, FileText, Info } from 'lucide-react'
import UserContext from '../context/user/UserContext'

function ResumeReview() {
  const [activeSection, setActiveSection] = useState('education')
  const { file } = useContext(UserContext)
  const [expandedSections, setExpandedSections] = useState({
    education: true,
    work_experience: false,
    projects: false,
    skills: false,
    measurable_metrics: false,
    formatting: false,
    keywords_ats: false,
    contact_info: false
  })

  const { resumeData } = useContext(UserContext)

  const objectUrl = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])


  const sectionWeights = {
    education: 10,
    work_experience: 25,
    projects: 15,
    skills: 15,
    measurable_metrics: 10,
    formatting_structure: 10,
    keywords_ats_optimization: 10,
    contact_information: 5
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }))
    setActiveSection(section)
  }

  const formatSectionName = (name) => {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    resumeData && (
      <div className="text-white bg-gray-800 bg-gradient-to-b from-gray-900 via-black to-black p-10 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_1fr] gap-6">
          <div className="space-y-6">
            <Card className="p-6 flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full border-8 border-gray-100 flex items-center justify-center mb-4">
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-green-500"
                    style={{ height: `${resumeData.total_score}%` }}
                  ></div>
                </div>
                <span className="text-4xl font-bold relative z-10">{resumeData.total_score}</span>
              </div>
              <h2 className="text-xl font-bold">Overall Score</h2>
              <p className="text-sm text-gray-300 text-center mt-2">out of 100 points</p>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-4">Scoring Breakdown</h3>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {Object.entries(resumeData.breakdown).map(([section, data]) => (
                    <div key={section} className="space-y-2">
                      <div
                        className={`flex justify-between items-center cursor-pointer ${
                          activeSection === section ? 'text-blue-600 font-medium' : ''
                        }`}
                        onClick={() => toggleSection(section)}
                      >
                        <div className="flex items-center gap-2">
                          {expandedSections[section] ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                          <span>{formatSectionName(section)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {data.score}/{sectionWeights[section]}
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={(data.score / sectionWeights[section]) * 100}
                        className="h-2"
                      />

                      {expandedSections[section] && (
                        <div className="pl-6 pt-2 text-sm text-gray-300">
                          <p>{data.summary}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Detailed Feedback</h2>
            <div className="mb-6">
              <h3 className="font-medium text-lg">{formatSectionName(activeSection)}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Progress
                  value={
                    (resumeData.breakdown[activeSection].score / sectionWeights[activeSection]) *
                    100
                  }
                  className="h-2 flex-1"
                />
                <span className="text-sm font-medium">
                  {resumeData.breakdown[activeSection].score}/{sectionWeights[activeSection]}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Info size={16} />
                  Summary
                </h4>
                <p className="text-gray-300">{resumeData.breakdown[activeSection].summary}</p>
              </div>

              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <FileText size={16} />
                  Improvement Suggestions
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-gray-300">
                  {resumeData.breakdown[activeSection].comments.map((comment, index) => (
                    <li key={index}>{comment}</li>
                  ))}
                </ul>
              </div>

              {activeSection === 'education' && (
                <div className="bg-blue-50 p-4 rounded-md mt-4">
                  <h4 className="font-medium text-blue-700 mb-2">Pro Tip</h4>
                  <p className="text-blue-700 text-sm">
                    For education, focus on relevant coursework and academic achievements that align
                    with your target role. If you're a recent graduate, your education should be
                    more detailed than if you have extensive work experience.
                  </p>
                </div>
              )}

              {activeSection === 'work_experience' && (
                <div className="bg-blue-50 p-4 rounded-md mt-4">
                  <h4 className="font-medium text-blue-700 mb-2">Pro Tip</h4>
                  <p className="text-blue-700 text-sm">
                    Use the STAR method (Situation, Task, Action, Result) to structure your work
                    achievements. Quantify your impact whenever possible with metrics and
                    percentages.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t">
              <h3 className="font-medium mb-3">Overall Assessment</h3>
              <p className="text-gray-300">{resumeData.overall_comment}</p>
            </div>
          </Card>
          <Card className="p-4">
            <h2 className="text-xl font-bold mb-4">Resume Preview</h2>
            <div className="bg-gray-100 rounded-md overflow-hidden">
              <div className="relative h-[600px] w-full">
                {file ? (
                  <iframe
                    src={objectUrl}
                    width="100%"
                    height="600px"
                    title="PDF Viewer"
                  ></iframe>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No resume uploaded. Please upload a PDF file to see the preview.
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-200">
                Click on sections in the left panel to see specific feedback
              </p>
            </div>
          </Card>
        </div>
      </div>
    )
  )
}

export default ResumeReview
